import db from '../schemas';
import { BenefitProduct, SequelizeBenefitProduct } from '../schemas/benefitProducts';

/**
 * Get all items on the table without any filter
 * @returns Promise<List of items>
 */
export const getAll = (): Promise<SequelizeBenefitProduct[]> => {
  return db.benefitProducts.findAll({
    include: [
      { model: db.products, as: 'products' },
      { model: db.benefits, as: 'benefits' }
    ]
  });
};

/**
 * Get a single item using the unique ID
 * @param id unique ID of the desired item
 * @returns Promise<Item>
 */
export const getById = (id: NonNullable<BenefitProduct['id']>): Promise<SequelizeBenefitProduct> => {
  return db.benefitProducts.findByPk(id, {
    include: [
      { model: db.products, as: 'products' },
      { model: db.benefits, as: 'benefits' }
    ]
  });
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @returns Promise<Item>
 */
export const create = (values: BenefitProduct | SequelizeBenefitProduct): Promise<SequelizeBenefitProduct> => {
  return db.benefitProducts.create(values);
};

/**
 * Function to update a row on the table by the unique ID
 *
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @returns Promise<Item>
 */
export const updateById = async (
  id: NonNullable<BenefitProduct['id']>,
  values: BenefitProduct | SequelizeBenefitProduct
): Promise<SequelizeBenefitProduct | null> => {
  // Trying to get item on the city
  const cityItem = await getById(id);
  if (cityItem) {
    // The update return an array [count, item[]], so I'm destructuring to get the updated benefit
    const [, [item]] = await db.benefitProducts.update(values, { where: { id }, returning: true });
    return item;
  }
  return null;
};

/**
 * Function to delete a row on the table by the unique ID
 * @param id unique ID of the desired item
 */
export const deleteById = async (id: NonNullable<BenefitProduct['id']>): Promise<void> => {
  const cityItem = await getById(id);
  if (cityItem) {
    await db.benefitProducts.destroy({ where: { id } });
  }
};
