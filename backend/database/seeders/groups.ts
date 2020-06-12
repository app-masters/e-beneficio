import faker from 'faker/locale/pt_BR';
import db from '../../src/schemas';
import { Group } from '../../src/schemas/groups';

const GROUPS_COUNT = 5;

/**
 * Seed the groups table
 */
const seed = async () => {
  const alreadyCreated = await db.groups.findAll();
  if (alreadyCreated.length < GROUPS_COUNT) {
    const itemsToCreate = Array(GROUPS_COUNT - alreadyCreated.length)
      .fill({})
      .map(() => ({
        title: faker.commerce.department()
      })) as Group[];
    if (itemsToCreate.length > 0) {
      await db.groups.bulkCreate(itemsToCreate);
    }
    console.log(`[seed] Groups: Seeded successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] Groups: Nothing to seed`);
  }
};

export default { seed };
