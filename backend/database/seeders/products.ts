import faker from 'faker';
import db from '../../src/schemas';
import { Product } from '../../src/schemas/products';

const PRODUCTS_COUNT = 100;

/**
 * Seed the products table
 */
const seed = async () => {
  const alreadyCreated = await db.products.findAll();
  if (alreadyCreated.length < PRODUCTS_COUNT) {
    const itemsToCreate = Array(PRODUCTS_COUNT - alreadyCreated.length)
      .fill({})
      .map(() => ({
        name: faker.commerce.productName(),
        isValid: Math.random() > 0.2 ? Math.random() > 0.2 : null
      })) as Product[];
    if (itemsToCreate.length > 0) {
      await db.products.bulkCreate(itemsToCreate);
    }
    console.log(`[seed] Products: Seeded successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] Products: Nothing to seed`);
  }
};

export default { seed };
