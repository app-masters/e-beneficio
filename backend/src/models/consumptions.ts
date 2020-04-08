import db from '../schemas';
import { Consumption, SequelizeConsumption } from '../schemas/consumptions';
import { PlaceStore } from '../schemas/placeStores';

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
  if (consumption) return consumption; // Just retuning it for now
  // Not found, create it
  return db.consumptions.create({ ...values, placeStoreId });
};
