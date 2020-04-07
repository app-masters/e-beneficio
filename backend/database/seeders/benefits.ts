import db from '../../src/schemas';
import { Benefit } from '../../src/schemas/benefits';

const list = [
  {
    title: '[CAD25123] Auxilio municipal de alimentação',
    groupName: 'Extrema pobreza',
    month: 3,
    year: 2020,
    value: 500
  },
  {
    title: '[CAD25123] Auxilio municipal de alimentação',
    groupName: 'Linha da pobreza',
    month: 3,
    year: 2020,
    value: 300
  }
] as Benefit[];

/**
 * Seed the benefits table
 */
const seed = async () => {
  const alreadyCreated = await db.benefits.findAll();
  if (alreadyCreated.length < list.length) {
    const institutions = await db.institutions.findAll();
    const itemsToCreate = list
      .map((item, index) => {
        const created = alreadyCreated.find((dbItem) => dbItem.title === item.title);
        if (created) return null; // Item is already created, don't create it again
        const institutionIndex = index % institutions.length; // Getting a cityId from the list
        return { ...item, institutionId: institutions[institutionIndex].id };
      })
      .filter(Boolean) as Benefit[];
    if (itemsToCreate.length > 0) {
      await db.benefits.bulkCreate(itemsToCreate);
    }
    console.log(`[seed] Benefits: Seeded successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] Benefits: Nothing to seed`);
  }
};

export default { seed };