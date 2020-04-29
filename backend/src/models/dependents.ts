import Sequelize from 'sequelize';
import db from '../schemas';
import { Dependent, SequelizeDependent } from '../schemas/depedents';
import { FamilyItem, SislameItem } from '../typings/filesItems';
import moment from 'moment';
import { Family } from '../schemas/families';

/**
 * Generate Dependent object from CSV files items
 * @param familyItem Family CSV item
 * @param sislameItem Sislame CSV item
 * @returns Dependent object
 */
export const parseFamilyAndSislameItems = (familyItem: FamilyItem, sislameItem: SislameItem): Dependent => {
  return {
    familyId: 0,
    name: familyItem['DEPENDENTE'].toUpperCase(),
    nis: familyItem['NISDEPENDEN'],
    birthday: moment(familyItem['DTNASCDEP'], 'DD/MM/YYYY').toISOString(),
    schoolName: sislameItem['Escola']
  };
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @returns Promise<Item>
 */
export const create = (values: Dependent | SequelizeDependent): Promise<SequelizeDependent> => {
  return db.dependents.create(values);
};

/**
 * Deactivate dependents that are not on the list
 * @param familyId family unique ID
 * @param idsToKeepActive list of IDs of dependents of the family that will not be deactivated
 * @returns Promise with sequelize update
 */
export const deactivateOthersOnFamily = (
  familyId: NonNullable<Family['id']>,
  idsToKeepActive: NonNullable<Dependent['id']>[]
) => {
  return db.dependents.update(
    { deactivatedAt: moment().toDate() },
    { where: { deactivatedAt: null, familyId, id: { [Sequelize.Op.notIn]: idsToKeepActive } } }
  );
};

/**
 * Create or update dependent object
 * @param item Dependent Object
 */
export const certifyByNIS = async (item: Dependent) => {
  const [createdItem, created] = await db.dependents.findCreateFind({ where: { nis: item.nis }, defaults: item });
  if (!created) {
    // Just update the item with the new data
    const [, [dbItem]] = await db.dependents.update(
      { ...item, deactivatedAt: null },
      { where: { id: createdItem.id as number }, returning: true }
    );

    return dbItem;
  } else {
    // Item created
    return createdItem;
  }
};

/**
 * Certify whole list of dependents of the family
 * @param familyId family unique ID
 * @param dependents list of dependents
 */
export const certifyDependentsByFamilyList = async (familyId: NonNullable<Family['id']>, dependents: Dependent[]) => {
  const dbDependents = await Promise.all(dependents.map((dependent) => certifyByNIS({ ...dependent, familyId })));
  const idsToKeep = dbDependents.map((item) => item.id as number);
  await deactivateOthersOnFamily(familyId, idsToKeep);
  return dbDependents;
};
