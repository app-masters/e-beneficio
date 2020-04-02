import db from '../../src/schemas';
import { PlaceStore } from '../../src/schemas/placeStores';

const list = [
  { title: 'Unidade Centro' },
  { title: 'Unidade Granbery' },
  { title: 'Shopping Cidade' },
  { title: 'Rodoviária' }
];

/**
 * Seed the place stores table
 */
const seed = async () => {
  const alreadyCreated = await db.placeStores.findAll();
  if (alreadyCreated.length < list.length) {
    const cities = await db.cities.findAll();
    const places = await db.places.findAll();
    const itemsToCreate = list
      .map((item, index) => {
        const created = alreadyCreated.find((dbItem) => dbItem.title === item.title);
        if (created) return null; // Item is already created, don't create it again
        const cityIndex = (index + 1) % cities.length; // Getting a cityId from the list
        const placeIndex = (index + 1) % places.length; // Getting a placeId from the list
        return { ...item, cityId: cities[cityIndex].id, placeId: places[placeIndex].id };
      })
      .filter(Boolean) as PlaceStore[];
    if (itemsToCreate.length > 0) {
      await db.placeStores.bulkCreate(itemsToCreate);
    }
    console.log(`[seed] PlaceStores: Sedeed successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] PlaceStores: Nothing to seed`);
  }
};

export default { seed };
