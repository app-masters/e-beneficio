import db from '../schemas';
import { Benefit, SequelizeBenefit } from '../schemas/benefits';
import { City } from '../schemas/cities';

/**
 * Get all items on the table without any filter
 * @param cityId logged user city ID
 * @returns Promise<List of items>
 */
export const getAll = (cityId: NonNullable<City['id']>): Promise<SequelizeBenefit[]> => {
  return db.benefits.findAll({ include: [{ model: db.institutions, as: 'institution', where: { cityId } }] });
};

/**
 * Get a single item using the unique ID
 * @param id unique ID of the desired item
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const getById = (id: NonNullable<Benefit['id']>, cityId: NonNullable<City['id']>): Promise<SequelizeBenefit> => {
  return db.benefits.findByPk(id, { include: [{ model: db.institutions, as: 'institution', where: { cityId } }] });
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @returns Promise<Item>
 */
export const create = (values: Benefit | SequelizeBenefit): Promise<SequelizeBenefit> => {
  return db.benefits.create(values);
};

/**
 * Function to update a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const updateById = async (
  id: NonNullable<Benefit['id']>,
  values: Benefit | SequelizeBenefit,
  cityId: NonNullable<City['id']>
): Promise<SequelizeBenefit | null> => {
  // Trying to get item on the city
  const cityItem = await getById(id, cityId);
  if (cityItem) {
    // The update return an array [count, item[]], so I'm destructuring to get the updated benefit
    const [, [item]] = await db.benefits.update(values, { where: { id }, returning: true });
    return item;
  }
  return null;
};

/**
 * Function to delete a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param cityId logged user city ID
 */
export const deleteById = async (id: NonNullable<Benefit['id']>, cityId: NonNullable<City['id']>): Promise<void> => {
  const cityItem = await getById(id, cityId);
  if (cityItem) {
    await db.benefits.destroy({ where: { id } });
  }
};
