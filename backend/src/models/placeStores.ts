import db from '../schemas';
import { PlaceStore, SequelizePlaceStore } from '../schemas/placeStores';
import { City } from '../schemas/cities';

/**
 * Get all items on the table without any filter
 * @param cityId logged user city ID
 * @returns Promise<List of items>
 */
export const getAll = (cityId: NonNullable<City['id']>): Promise<SequelizePlaceStore[]> => {
  return db.placeStores.findAll({ where: { cityId }, include: [{ model: db.places, as: 'place' }] });
};

/**
 * Get a single item using the unique ID
 * @param id unique ID of the desired item
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const getById = async (
  id: NonNullable<PlaceStore['id']>,
  cityId: NonNullable<City['id']>
): Promise<SequelizePlaceStore | null> => {
  const item = await db.placeStores.findByPk(id);
  if (item?.cityId === cityId) return item;
  return null;
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const create = (
  values: PlaceStore | SequelizePlaceStore,
  cityId: NonNullable<City['id']>
): Promise<SequelizePlaceStore> => {
  return db.placeStores.create({ ...values, cityId });
};

/**
 * Function to update a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const updateById = async (
  id: NonNullable<PlaceStore['id']>,
  values: PlaceStore | SequelizePlaceStore,
  cityId: NonNullable<City['id']>
): Promise<SequelizePlaceStore | null> => {
  // Check if item is on the city
  const cityItem = getById(id, cityId);
  if (cityItem) {
    // The update return an array [count, item[]], so I'm destructuring to get the updated placeStore
    const [, [item]] = await db.placeStores.update(values, { where: { id }, returning: true });
    return item;
  }
  return null;
};

/**
 * Function to delete a row on the table by the unique ID
 * @param id unique ID of the desired item *
 * @param cityId logged user city ID
 */
export const deleteById = async (id: NonNullable<PlaceStore['id']>, cityId: NonNullable<City['id']>): Promise<void> => {
  const cityItem = getById(id, cityId);
  if (cityItem) {
    await db.placeStores.destroy({ where: { id } });
  }
};
