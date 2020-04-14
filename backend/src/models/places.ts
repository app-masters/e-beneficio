import db from '../schemas';
import { Place, SequelizePlace } from '../schemas/places';
import { City } from '../schemas/cities';
import { PlaceStore } from '../schemas/placeStores';

/**
 * Get all items on the table without any filter
 * @param cityId logged user city ID
 * @returns Promise<List of items>
 */
export const getAll = (cityId: NonNullable<City['id']>): Promise<SequelizePlace[]> => {
  return db.places.findAll({ where: { cityId } });
};

/**
 * Get a single item using the unique ID
 * @param id unique ID of the desired item
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const getById = async (
  id: NonNullable<Place['id']>,
  cityId: NonNullable<City['id']>
): Promise<SequelizePlace | null> => {
  const item = await db.places.findByPk(id);
  if (item?.cityId === cityId) return item;
  return null;
};

/**
 * Get a single item using the children place store ID
 * @param placeStoreId unique ID linked to the desired item
 * @returns Promise<Item>
 */
export const getByPlaceStoreId = async (
  placeStoreId: NonNullable<PlaceStore['id']>
): Promise<SequelizePlace | undefined> => {
  const [item] = await db.places.findAll({
    include: [{ model: db.placeStores, as: 'placeStores', where: { id: placeStoreId } }]
  });
  return item;
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const create = (values: Place | SequelizePlace, cityId: NonNullable<City['id']>): Promise<SequelizePlace> => {
  return db.places.create({ ...values, cityId });
};

/**
 * Function to update a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const updateById = async (
  id: NonNullable<Place['id']>,
  values: Place | SequelizePlace,
  cityId: NonNullable<City['id']>
): Promise<SequelizePlace | null> => {
  // Check if item is on the city
  const cityItem = getById(id, cityId);
  if (cityItem) {
    // The update return an array [count, item[]], so I'm destructuring to get the updated place
    const [, [item]] = await db.places.update(values, { where: { id }, returning: true });
    return item;
  }
  return null;
};

/**
 * Function to delete a row on the table by the unique ID
 * @param id unique ID of the desired item *
 * @param cityId logged user city ID
 */
export const deleteById = async (id: NonNullable<Place['id']>, cityId: NonNullable<City['id']>): Promise<void> => {
  const cityItem = getById(id, cityId);
  if (cityItem) {
    await db.places.destroy({ where: { id } });
  }
};
