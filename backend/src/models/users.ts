import db from '../schemas';
import { User, SequelizeUser } from '../schemas/users';
import { City } from '../schemas/cities';
import { Place } from '../schemas/places';

/**
 * Get all items on the table without any filter
 * @param cityId logged user city ID
 * @param placeId logged user place ID
 * @returns Promise<List of items>
 */
export const getAll = (
  cityId: NonNullable<City['id']>,
  placeId?: NonNullable<Place['id']>
): Promise<SequelizeUser[]> => {
  if (placeId) {
    return db.users.findAll({
      where: { cityId },
      include: [{ model: db.placeStores, as: 'placeStore', where: { placeId } }]
    });
  }
  return db.users.findAll({ where: { cityId } });
};

/**
 * Get a single item using the unique ID
 * @param id unique ID of the desired item
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const getById = async (
  id: NonNullable<User['id']>,
  cityId: NonNullable<City['id']>
): Promise<SequelizeUser | null> => {
  const item = await db.users.findByPk(id);
  if (item?.cityId === cityId) return item;
  return null;
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const create = (values: User | SequelizeUser, cityId: NonNullable<City['id']>): Promise<SequelizeUser> => {
  return db.users.create({ ...values, cityId });
};

/**
 * Function to update a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const updateById = async (
  id: NonNullable<User['id']>,
  values: User | SequelizeUser,
  cityId: NonNullable<City['id']>
): Promise<SequelizeUser | null> => {
  // Check if item is on the city
  const cityItem = getById(id, cityId);
  if (cityItem) {
    // The update return an array [count, item[]], so I'm destructuring to get the updated user
    const [, [item]] = await db.users.update(values, { where: { id }, returning: true });
    return item;
  }
  return null;
};

/**
 * Function to delete a row on the table by the unique ID
 * @param id unique ID of the desired item *
 * @param cityId logged user city ID
 */
export const deleteById = async (id: NonNullable<User['id']>, cityId: NonNullable<City['id']>): Promise<void> => {
  const cityItem = getById(id, cityId);
  if (cityItem) {
    await db.users.destroy({ where: { id } });
  }
};
