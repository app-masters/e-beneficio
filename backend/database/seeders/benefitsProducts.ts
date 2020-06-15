import db from '../../src/schemas';
import { BenefitProduct } from '../../src/schemas/benefitProducts';

/**
 * Generate random int
 * @param min min value
 * @param max max value
 * @returns value
 */
const randomInt = (min: number, max: number) => {
  return min + Math.floor((max - min) * Math.random());
};

// eslint-disable-next-line prefer-spread
const list = Array.apply(null, Array(90)).map((x, i) => {
  return { productId: i + 1, benefitId: randomInt(1, 4), amount: randomInt(1, 10) };
}) as BenefitProduct[];

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
