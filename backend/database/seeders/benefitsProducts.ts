import db from '../../src/schemas';
import { BenefitProduct } from '../../src/schemas/benefitProducts';

const list = [
  {
    productId: 5,
    benefitId: 1,
    amount: 2
  },
  {
    productId: 6,
    benefitId: 2,
    amount: 2
  },
  {
    productId: 7,
    benefitId: 2,
    amount: 2
  },
  {
    productId: 8,
    benefitId: 2,
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
