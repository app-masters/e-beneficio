import db from '../../src/schemas';
import { BenefitProduct } from '../../src/schemas/benefitProducts';

const list = [
  {
    productsId: 5,
    benefitsId: 1,
    amount: 2
  },
  {
    productsId: 6,
    benefitsId: 2,
    amount: 2
  },
  {
    productsId: 7,
    benefitsId: 2,
    amount: 2
  },
  {
    productsId: 8,
    benefitsId: 2,
    amount: 2
  }
] as BenefitProduct[];

/**
 * Seed the benefits table
 */
const seed = async () => {
  const alreadyCreated = await db.benefitProducts.findAll();
  if (alreadyCreated.length < list.length) {
    await db.benefitProducts.bulkCreate(list);
    console.log(`[seed] Benefits: Seeded successfully - ${list.length} new created`);
  } else {
    console.log(`[seed] Benefits: Nothing to seed`);
  }
};

export default { seed, groupList: list };
