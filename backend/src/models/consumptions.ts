import Sequelize from 'sequelize';
import db from '../schemas';
import { Consumption, SequelizeConsumption } from '../schemas/consumptions';
import { PlaceStore } from '../schemas/placeStores';
import { Family } from '../schemas/families';
import moment from 'moment';
import logging from '../utils/logging';
import { Place } from '../schemas/places';
import { City } from '../schemas/cities';
import { Benefit } from '../schemas/benefits';
import { Dependent } from '../schemas/depedents';
import { scrapeNFCeData } from '../utils/nfceScraper';

/**
 * a
 * @param family a
 * @param availableBenefits a
 */
export const getFamilyDependentBalance = async (family: Family, availableBenefits?: Benefit[]) => {
  if (!family.dependents || !family.consumptions) {
    // Be sure that everything necessesary is populated
    const populatedFamily = await db.families.findByPk(family.id, {
      include: [
        { model: db.dependents, as: 'dependents' },
        { model: db.consumptions, as: 'consumptions' }
      ]
    });
    if (populatedFamily) {
      family = populatedFamily;
    }
  }

  if (!availableBenefits) {
    // Populating benefits if it's not available
    availableBenefits = await db.benefits.findAll({
      where: { groupName: family.groupName },
      include: [{ model: db.institutions, as: 'institution', where: { cityId: family.cityId } }]
    });
  }

  const todayMonth = moment().month() + 1;
  const todayYear = moment().year();

  let balance = 0;
  for (const dependent of family.dependents as Dependent[]) {
    const startMonth = moment(dependent.createdAt as Date).month() + 1;
    const startYear = moment(dependent.createdAt as Date).year();
    const endMonth = moment(dependent.deactivatedAt as Date).month() + 1;
    const endYear = moment(dependent.deactivatedAt as Date).year();

    for (const benefit of availableBenefits) {
      if (benefit.groupName !== family.groupName) continue; // Don't check if it's from another group

      // Check all the dates
      const notInFuture = benefit.year < todayYear || (benefit.year === todayYear && benefit.month <= todayMonth);
      const afterCreation = benefit.year > startYear || (benefit.year === startYear && benefit.month >= startMonth);
      const beforeDeactivation = dependent.deactivatedAt
        ? benefit.year < endYear || (benefit.year === endYear && benefit.month < endMonth)
        : true;

      if (notInFuture && afterCreation && beforeDeactivation) {
        // Valid benefit
        balance += benefit.value;
      }
    }
  }

  if (!family.consumptions || family.consumptions.length < 1) {
    // Family without consumptions
    return balance;
  }

  // Calculating consumption
  const consumption = family.consumptions.reduce((sum, item) => sum + item.value, 0);
  return balance - consumption;
};

/**
 * Get balance report for all families
 * @param cityId logged user city unique ID
 */
export const getBalanceReport = async (cityId: NonNullable<City['id']>) => {
  const families = await db.families.findAll({
    where: { cityId },
    include: [
      { model: db.dependents, as: 'dependents' },
      { model: db.consumptions, as: 'consumptions', required: false }
    ]
  });

  const benefits = await db.benefits.findAll({
    include: [{ model: db.institutions, as: 'institution', where: { cityId } }]
  });

  const balanceList: (Family & { balance: number })[] = [];
  for (const family of families) {
    const balance = await getFamilyDependentBalance(family, benefits);
    balanceList.push({ ...(family.toJSON() as Family), balance });
  }

  return balanceList;
};

/**
 * Get family balace looking for benefits and consumptions
 * @param family Family object
 */
export const getFamilyBalance = async (family: Family): Promise<number> => {
  // Get all benefits from the family group

  const familyStartMonth = moment(family.createdAt as Date).month() + 1;
  const familyStartYear = moment(family.createdAt as Date).year();
  const todayMonth = moment().month() + 1;
  const todayYear = moment().year();

  const [benefit] = await db.benefits.findAll({
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.or]: [
            { year: { [Sequelize.Op.gt]: familyStartYear } },
            { year: familyStartYear, month: { [Sequelize.Op.gte]: familyStartMonth } }
          ]
        },
        {
          [Sequelize.Op.or]: [
            { year: { [Sequelize.Op.lt]: todayYear } },
            { year: todayYear, month: { [Sequelize.Op.lte]: todayMonth } }
          ]
        },
        { groupName: family.groupName }
      ]
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
  placeStoreId?: NonNullable<PlaceStore['id']>
): Promise<SequelizeConsumption> => {
  // TODO: this is the main function of the entire application, but for now will be really basic
  const [consumption] = values.nfce ? await db.consumptions.findAll({ where: { nfce: values.nfce } }) : [null];
  if (consumption) {
    if (process.env.NODE_ENV === 'development') {
      return consumption;
    }
    throw { status: 409, message: 'Esse NFCe já foi registrado' };
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

  const balance = await getFamilyDependentBalance(family);
  if (balance < values.value) {
    // Insuficient balance
    throw { status: 422, message: 'Saldo insuficiente' };
  }
  // Everything is ok, create it
  return db.consumptions.create({ ...values, placeStoreId });
};

/**
 * Get report for consumptions on the place on the interval
 * @param minDate start of interval
 * @param maxDate end of interval
 * @param placeId place unique ID
 * @param placeStoreId place unique ID
 * @returns Promise<List of items>
 */
export const getPlaceConsumptionsReport = async (
  minDate: Date | string,
  maxDate: Date | string,
  placeId?: NonNullable<Place['id']>,
  placeStoreId?: NonNullable<PlaceStore['id']>
) => {
  const start = moment(minDate).startOf('day');
  const end = moment(maxDate).endOf('day');

  if (!start.isValid() || !end.isValid()) {
    throw { status: 422, message: 'Invalid date provided to the query' };
  }

  const consumptions = await db.consumptions.findAll({
    where: {
      [Sequelize.Op.and]: [
        { createdAt: { [Sequelize.Op.gte]: start.toDate() } },
        { createdAt: { [Sequelize.Op.lte]: end.toDate() } },
        placeStoreId ? { placeStoreId } : {}
      ]
    },
    include: [{ model: db.placeStores, as: 'placeStore', where: placeId ? { placeId } : {} }],
    attributes: ['placeStoreId', [Sequelize.fn('sum', Sequelize.col('value')), 'total']],
    group: ['placeStore.id', 'Consumptions.placeStoreId']
  });

  const total = consumptions.reduce((sum, consumption) => sum + (consumption.toJSON() as { total: number }).total, 0);

  return { data: consumptions, total };
};

/**
 * Count how many unique families have consumptions saved on the period
 * @param dateStart period start
 * @param dateEnd period end
 * @param placeStoreId place store unique ID
 */
export const countFamilies = async (
  dateStart: Date | string,
  dateEnd: Date | string,
  placeStoreId?: PlaceStore['id']
) => {
  const [data] = await db.consumptions.findAll({
    where: {
      [Sequelize.Op.and]: [
        { createdAt: { [Sequelize.Op.gte]: dateStart } },
        { createdAt: { [Sequelize.Op.lte]: dateEnd } },
        placeStoreId ? { placeStoreId } : {}
      ]
    },
    attributes: [[Sequelize.fn('count', Sequelize.fn('distinct', Sequelize.col('familyId'))), 'count']]
  });
  if (data) return Number((data.toJSON() as { count: number }).count || 0);
  return 0;
};

/**
 * Sum the total consumption values in the period
 * @param dateStart period start
 * @param dateEnd period end
 * @param placeStoreId place store unique ID
 */
export const sumConsumptions = async (
  dateStart: Date | string,
  dateEnd: Date | string,
  placeStoreId?: PlaceStore['id']
) => {
  const [data] = await db.consumptions.findAll({
    where: {
      [Sequelize.Op.and]: [
        { createdAt: { [Sequelize.Op.gte]: dateStart } },
        { createdAt: { [Sequelize.Op.lte]: dateEnd } },
        placeStoreId ? { placeStoreId } : {}
      ]
    },
    attributes: [[Sequelize.fn('sum', Sequelize.col('value')), 'total']]
  });

  if (data) return (data.toJSON() as { total: number }).total || 0;
  return 0;
};

/**
 * Get consumption dashboard info
 * @param cityId logged user city ID
 * @param placeStoreId logged user place store ID
 */
export const getConsumptionDashboardInfo = async (cityId: NonNullable<City['id']>, placeStoreId?: PlaceStore['id']) => {
  const dashboardReturn = {
    todayFamilies: 0,
    weekFamilies: 0,
    monthFamilies: 0,
    todayConsumption: 0,
    weekConsumption: 0,
    monthConsumption: 0
  };

  const today = moment().toDate();
  const startToday = moment().startOf('day').toDate();
  const startWeek = moment().subtract(7, 'days').toDate();
  const startMonth = moment().subtract(30, 'days').toDate();

  // Await for all the promises
  [
    dashboardReturn.todayConsumption,
    dashboardReturn.weekConsumption,
    dashboardReturn.monthConsumption,
    dashboardReturn.todayFamilies,
    dashboardReturn.weekFamilies,
    dashboardReturn.monthFamilies
  ] = await Promise.all([
    sumConsumptions(startToday, today, placeStoreId),
    sumConsumptions(startWeek, today, placeStoreId),
    sumConsumptions(startMonth, today, placeStoreId),
    countFamilies(startToday, today, placeStoreId),
    countFamilies(startWeek, today, placeStoreId),
    countFamilies(startMonth, today, placeStoreId)
  ]);

  return dashboardReturn;
};

/**
 * Scrape the consumption nfce page for details about the purchase
 *
 * @param consumption Consumption object with the nfce link
 */
export const scrapeConsumption = async (consumption: Consumption) => {
  try {
    const link = consumption.nfce;
    if (!link || !consumption.id) return;

    // Find the data avout the purchase in the Receita Federal site
    const purchaseData = await scrapeNFCeData(link);

    consumption.purchaseData = purchaseData;
    await db.consumptions.update({ purchaseData }, { where: { id: consumption.id } });

    // For each product in the purchase, check it exists and save it in the database
    await Promise.all(
      purchaseData.products.map(async ({ name }) => {
        if (!name) return;
        const existProduct = await db.products.findOne({ where: { name } });
        if (!existProduct) {
          await db.products.create({ name });
        }
      })
    );
  } catch (error) {
    logging.error('Failed to scrape nfce link data', error);
  }
};
