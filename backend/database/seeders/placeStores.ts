import db from '../../src/schemas';
import { PlaceStore } from '../../src/schemas/placeStores';

const list = [
  { title: 'Unidade Centro', cnpj: '0000001', address: 'Avenida Central, 2502 - Centro' },
  { title: 'Unidade Novo Recanto', cnpj: '0000002', address: 'Rua São Paulo, 99 - Novo Recanto' },
  { title: 'Shopping Cidade', cnpj: '0000003', address: 'Avenida Central, 22 - Alvorada' },
  { title: 'Rodoviária', cnpj: '0000004', address: 'Avenida Brasil, 2 - Novo Jardim' }
] as PlaceStore[];

/**
 * Seed the place stores table
 */
const seed = async () => {
  const alreadyCreated = await db.placeStores.findAll();
  if (alreadyCreated.length < list.length) {
    const places = await db.places.findAll();
    const itemsToCreate = list
      .map((item, index) => {
        const created = alreadyCreated.find((dbItem) => dbItem.title === item.title);
        if (created) return null; // Item is already created, don't create it again
        const placeIndex = index % places.length; // Getting a placeId from the list
        const place = places[placeIndex];
        return { ...item, placeId: place.id, cityId: place.cityId };
      })
      .filter(Boolean) as PlaceStore[];
    if (itemsToCreate.length > 0) {
      await db.placeStores.bulkCreate(itemsToCreate);
    }
    console.log(`[seed] PlaceStores: Seeded successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] PlaceStores: Nothing to seed`);
  }
};

export default { seed };
