import db from '../schemas';
import { Family, SequelizeFamily } from '../schemas/families';
import { City } from '../schemas/cities';

/**
 * Get all items on the table without any filter
 * @param nis searched nis code
 * @param cityId logged user city ID
 * @returns Promise<List of items>
 */
export const findByNis = async (
  nis: NonNullable<Family['responsibleNis']>,
  cityId: NonNullable<City['id']>
): Promise<SequelizeFamily> => {
  console.log(nis);
  const [family] = await db.families.findAll({ where: { responsibleNis: nis, cityId }, limit: 1 });
  return family;
};
