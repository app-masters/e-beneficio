import Sequelize from 'sequelize';
import db from '../schemas';
import { Consumption, SequelizeConsumption } from '../schemas/consumptions';
import { PlaceStore } from '../schemas/placeStores';
import { Family } from '../schemas/families';
import moment from 'moment';
import logging from '../utils/logging';

/**
 * Get family balace looking for benefits and consumptions
 * @param family Family object
 */
export const getFamilyBalance = async (family: Family): Promise<number> => {
  // Get all benefits from the family group
  const [benefit] = await db.benefits.findAll({
    where: {
      month: { [Sequelize.Op.gte]: moment(family.createdAt as Date).month() + 1 }, // Deal with year
      groupName: family.groupName
    },
    attributes: ['groupName', [Sequelize.fn('sum', Sequelize.col('value')), 'total']],
    include: [{ model: db.institutions, as: 'institution', where: { cityId: family.cityId }, attributes: [] }],
    group: ['Benefits.groupName']
  });

  // Get all consumptions already made
  const [consumption] = await db.consumptions.findAll({
    where: { familyId: family.id as number },
    attributes: ['familyId', [Sequelize.fn('sum', Sequelize.col('value')), 'total']],
    group: ['Consumptions.familyId']
  });

  if (!benefit) {
    // No benefits created for this group yet
    return 0;
  }

  if (consumption) {
    // Some consumption is already made, removing it from the total value
    const balance = (benefit.toJSON() as { total: number }).total - (consumption.toJSON() as { total: number }).total;
    if (balance < 0) {
      logging.critical('Family with negative balance', { family });
    }
    return balance;
  }

  // No consumption, just returning the benefit;
  return (benefit.toJSON() as { total: number }).total;
};

/**
 * Create a new consumption on the store
 * @param values consumption object
 * @param placeStoreId logged user place store ID
 * @returns Promise<List of items>
 */
export const addConsumption = async (
  values: Consumption,
  placeStoreId: NonNullable<PlaceStore['id']>
): Promise<SequelizeConsumption> => {
  // TODO: this is the main function of the entire application, but for now will be really basic
  const [consumption] = await db.consumptions.findAll({ where: { nfce: values.nfce } });
  if (consumption) {
    logging.warning('Adding consumption with duplicated NFCe', { consumption: consumption.toJSON(), values });
    // return consumption; // Just retuning it for now
  }

  // Checking everyting
  if (values.value < 0) {
    // Negative consumption
    throw { status: 422, message: 'Compra não pode ter valor negativo' };
  }
  const family = await db.families.findByPk(values.familyId);
  if (!family) {
    // Invalid family ID
    throw { status: 422, message: 'Família não encontrada' };
  }

  const balance = await getFamilyBalance(family);
  if (balance < values.value) {
    // Insuficient balance
    throw { status: 422, message: 'Saldo insuficiente' };
  }
  // Everything is ok, create it
  return db.consumptions.create({ ...values, placeStoreId });
};
