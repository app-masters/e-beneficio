import db from '../schemas';
import { City, SequelizeCity } from '../schemas/city';

/**
 * Get all items on the table without any filter
 * @returns Promise<List of items>
 */
export const getAll = (): Promise<SequelizeCity[]> => {
  return db.cities.findAll();
};

/**
 * Get a single item using the unique ID
 * @param id unique ID of the desired item
 * @returns Promise<Item>
 */
export const getById = (id: string | number): Promise<SequelizeCity> => {
  return db.cities.findByPk(id);
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @returns Promise<Item>
 */
export const create = (values: City | SequelizeCity): Promise<SequelizeCity> => {
  return db.cities.create(values);
};

/**
 * Function to update a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @returns Promise<Item>
 */
export const updateById = async (id: string | number, values: City | SequelizeCity): Promise<SequelizeCity> => {
  // The update return an array [count, item[]], so I'm destructuring to get the updated city
  const [, [city]] = await db.cities.update(values, { where: { id } });
  return city;
};

/**
 * Function to delete a row on the table by the unique ID
 * @param id unique ID of the desired item
 */
export const deleteById = (id: string | number): void => {
  db.cities.destroy({ where: { id } });
};
