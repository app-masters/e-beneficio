import db from '../../src/schemas';
import { Place } from '../../src/schemas/places';

const list = [{ title: 'Rede de Supermercados Silva' }, { title: 'Drogarias do Geraldo' }];

/**
 * Seed the places table
 */
const seed = async () => {
  const alreadyCreated = await db.places.findAll();
  if (alreadyCreated.length < list.length) {
    const cities = await db.cities.findAll();
    const itemsToCreate = list
      .map((item, index) => {
        const created = alreadyCreated.find((dbItem) => dbItem.title === item.title);
        if (created) return null; // Item is already created, don't create it again
        const cityIndex = index % cities.length; // Getting a cityId from the list
        return { ...item, cityId: cities[cityIndex].id };
      })
      .filter(Boolean) as Place[];
    if (itemsToCreate.length > 0) {
      await db.places.bulkCreate(itemsToCreate);
    }
    console.log(`[seed] Places: Sedeed successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] Places: Nothing to seed`);
  }
};

export default { seed };
