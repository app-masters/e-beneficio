import db from '../schemas';
import { Product, SequelizeProduct } from '../schemas/products';

/**
 * Get all items on the table without any filter
 * @returns Promise<List of items>
 */
export const getAll = (): Promise<SequelizeProduct[]> => {
  return db.products.findAll();
};

/**
 * Get all items on the table with isValid unset
 * @returns Promise<List of items>
 */
export const getAllUnset = (): Promise<SequelizeProduct[]> => {
  return db.products.findAll({ where: { isValid: null } });
};

/**
 * Get a single item using the unique ID
 * @param id unique ID of the desired item
 * @returns Promise<Item>
 */
export const getById = (id: string | number): Promise<SequelizeProduct> => {
  return db.products.findByPk(id);
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @returns Promise<Item>
 */
export const create = (values: Product | SequelizeProduct): Promise<SequelizeProduct> => {
  return db.products.create(values);
};

/**
 * Function to update a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @returns Promise<Item>
 */
export const updateById = async (
  id: string | number,
  values: Partial<Product> | SequelizeProduct
): Promise<SequelizeProduct> => {
  // The update return an array [count, item[]], so I'm destructuring to get the updated product
  const [, [item]] = await db.products.update(values, { where: { id }, returning: true });
  return item;
};

/**
 * Function to delete a row on the table by the unique ID
 * @param id unique ID of the desired item
 */
export const deleteById = (id: string | number): void => {
  db.products.destroy({ where: { id } });
};
