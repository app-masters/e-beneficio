import db from '../schemas';
import { Benefit, SequelizeBenefit } from '../schemas/benefits';
import { City } from '../schemas/cities';

/**
 * Get all items on the table without any filter
 * @param cityId logged user city ID
 * @returns Promise<List of items>
 */
export const getAll = (cityId: NonNullable<City['id']>): Promise<SequelizeBenefit[]> => {
  return db.benefits.findAll({ include: [{ model: db.institutions, as: 'institution', where: { cityId } }] });
};

/**
 * Get all items on the table without any filter
 * @param cityId logged user city ID
 * @returns Promise<List of items>
 */
export const getAllWithProduct = (cityId: NonNullable<City['id']>): Promise<any> => {
  return db.benefits.findAll({
    include: [
      { model: db.institutions, as: 'institution', where: { cityId } },
      { model: db.benefitProducts, as: 'benefitProduct', include: [{ model: db.products, as: 'products' }] }
    ]
  });
};

/**
 * Get a single item using the unique ID
 * @param id unique ID of the desired item
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const getById = (id: NonNullable<Benefit['id']>, cityId: NonNullable<City['id']>): Promise<SequelizeBenefit> => {
  return db.benefits.findByPk(id, { include: [{ model: db.institutions, as: 'institution', where: { cityId } }] });
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @returns Promise<Item>
 */
export const create = (values: Benefit | SequelizeBenefit): Promise<SequelizeBenefit> => {
  return db.benefits.create(values);
};

/**
 * Function to create a new row on the table using product
 * @param values object with the new item data
 * @returns Promise<Item>
 */
export const createWithProduct = async (values: Benefit | SequelizeBenefit): Promise<SequelizeBenefit> => {
  const created = await db.benefits.create(values);

  if (values.products && created) {
    const productList = values.products.map((i) => {
      i.benefitsId = created.id as number;
      return i;
    });
    db.benefitProducts.bulkCreate(productList);
  }

  return created;
};

/**
 * Function to update a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const updateById = async (
  id: NonNullable<Benefit['id']>,
  values: Benefit | SequelizeBenefit,
  cityId: NonNullable<City['id']>
): Promise<SequelizeBenefit | null> => {
  // Trying to get item on the city
  const cityItem = await getById(id, cityId);
  if (cityItem) {
    // The update return an array [count, item[]], so I'm destructuring to get the updated benefit
    const [, [item]] = await db.benefits.update(values, { where: { id }, returning: true });
    return item;
  }
  return null;
};

/**
 * Function to update a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @param cityId logged user city ID
 * @returns Promise<Item>
 */
export const updateWithProduct = async (
  id: NonNullable<Benefit['id']>,
  values: Benefit | SequelizeBenefit,
  cityId: NonNullable<City['id']>
): Promise<SequelizeBenefit | null> => {
  // Trying to get item on the city
  const cityItem = await getById(id, cityId);
  if (cityItem) {
    // The update return an array [count, item[]], so I'm destructuring to get the updated benefit
    const [, [updated]] = await db.benefits.update(values, { where: { id }, returning: true });
    const updatedProducts = await db.benefitProducts.findAll({ where: { benefitsId: updated.id as number } });

    if (values.products) {
      const list = values.products.map((i) => {
        i.benefitsId = updated.id as number;
        return i;
      });
      const productToUpdate = list.filter((f) => f.id);
      const productToAdd = list.filter((f) => !f.id);
      const productToRemove = updatedProducts.filter((a) => {
        const index = productToUpdate.find((f) => f.id === a.id);
        if (!index) return a;
      });

      await db.benefitProducts.bulkCreate(productToAdd);

      productToRemove.map(async (dt) => {
        await db.benefitProducts.destroy({ where: { id: dt.id } });
      });
      productToUpdate.map(async (up) => {
        await db.benefitProducts.update({ amount: up.amount }, { where: { id: up.id } });
      });
    }
  }
  return null;
};

/**
 * Function to delete a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param cityId logged user city ID
 */
export const deleteById = async (id: NonNullable<Benefit['id']>, cityId: NonNullable<City['id']>): Promise<void> => {
  const cityItem = await getById(id, cityId);
  if (cityItem) {
    await db.benefits.destroy({ where: { id } });
  }
};
