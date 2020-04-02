import db from '../schemas';
import { Institution, SequelizeInstitution } from '../schemas/institutions';

/**
 * Get all items on the table without any filter
 * @returns Promise<List of items>
 */
export const getAll = (): Promise<SequelizeInstitution[]> => {
  return db.institutions.findAll();
};

/**
 * Get a single item using the unique ID
 * @param id unique ID of the desired item
 * @returns Promise<Item>
 */
export const getById = (id: string | number): Promise<SequelizeInstitution> => {
  return db.institutions.findByPk(id);
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @returns Promise<Item>
 */
export const create = (values: Institution | SequelizeInstitution): Promise<SequelizeInstitution> => {
  return db.institutions.create(values);
};

/**
 * Function to update a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @returns Promise<Item>
 */
export const updateById = async (
  id: string | number,
  values: Institution | SequelizeInstitution
): Promise<SequelizeInstitution> => {
  // The update return an array [count, item[]], so I'm destructuring to get the updated institution
  const [, [item]] = await db.institutions.update(values, { where: { id }, returning: true });
  return item;
};

/**
 * Function to delete a row on the table by the unique ID
 * @param id unique ID of the desired item
 */
export const deleteById = (id: string | number): void => {
  db.institutions.destroy({ where: { id } });
};
