import db from '../../src/schemas';
import { ConsumptionProducts } from '../../src/schemas/consumptionProducts';

const list = [
  {
    productsId: 1,
    consumptionsId: 2,
    amount: 2
  },
  {
    productsId: 2,
    consumptionsId: 2,
    amount: 2
  },
  {
    productsId: 2,
    consumptionsId: 2,
    amount: 2
  },
  {
    productsId: 2,
    consumptionsId: 2,
    amount: 2
  },
  {
    productsId: 1,
    consumptionsId: 1,
    amount: 2
  },
  {
    productsId: 2,
    consumptionsId: 1,
    amount: 2
  }
] as ConsumptionProducts[];

/**
 * Seed the place stores table
 */
const seed = async () => {
  const alreadyCreated = await db.consumptionProducts.findAll();

  if (alreadyCreated.length === 0) {
    await db.consumptionProducts.bulkCreate(list);
    console.log(`[seed] Families: Seeded successfully - ${list.length} new created`);
  } else {
    console.log(`[seed] Families: Nothing to seed`);
  }
};

export default { seed };
