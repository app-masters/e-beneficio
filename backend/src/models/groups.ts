import db from '../schemas';
import { Group, SequelizeGroup } from '../schemas/groups';

/**
 * Get all items on the table without any filter
 * @returns Promise<List of items>
 */
export const getAll = (): Promise<SequelizeGroup[]> => {
  return db.groups.findAll();
};

/**
 * Get a single item using the unique ID
 * @param id unique ID of the desired item
 * @returns Promise<Item>
 */
export const getById = async (id: NonNullable<Group['id']>): Promise<SequelizeGroup | null> => {
  const item = await db.groups.findByPk(id);
  return item;
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @returns Promise<Item>
 */
export const create = (values: Group | SequelizeGroup): Promise<SequelizeGroup> => {
  return db.groups.create({ ...values });
};

/**
 * Function to update a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @returns Promise<Item>
 */
export const updateById = async (
  id: NonNullable<Group['id']>,
  values: Group | SequelizeGroup
): Promise<SequelizeGroup | null> => {
  // The update return an array [count, item[]], so I'm destructuring to get the updated Group
  const [, [item]] = await db.groups.update(values, { where: { id }, returning: true });
  return item;
};

/**
 * Function to delete a row on the table by the unique ID
 * @param id unique ID of the desired item *
 */
export const deleteById = async (id: NonNullable<Group['id']>): Promise<void> => {
  await db.groups.destroy({ where: { id } });
};
