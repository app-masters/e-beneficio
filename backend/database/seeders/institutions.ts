import db from '../../src/schemas';
import { Institution } from '../../src/schemas/institutions';

const list = [{ title: 'Prefeitura' }, { title: 'Governo Estadual' }];

/**
 * Seed the institutions table
 */
const seed = async () => {
  const alreadyCreated = await db.institutions.findAll();
  if (alreadyCreated.length < list.length) {
    const cities = await db.cities.findAll();
    const itemsToCreate = list
      .map((item, index) => {
        const created = alreadyCreated.find((dbItem) => dbItem.title === item.title);
        if (created) return null; // Item is already created, don't create it again
        const cityIndex = index % cities.length; // Getting a cityId from the list
        return { ...item, cityId: cities[cityIndex].id };
      })
      .filter(Boolean) as Institution[];
    if (itemsToCreate.length > 0) {
      await db.institutions.bulkCreate(itemsToCreate);
    }
    console.log(`[seed] Institutions: Seeded successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] Institutions: Nothing to seed`);
  }
};

export default { seed };
