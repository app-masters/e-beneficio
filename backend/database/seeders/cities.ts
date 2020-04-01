import db from '../../src/schemas';

const list = [{ title: 'Juiz de Fora/MG' }];

/**
 * Seed the cities table
 */
const seed = async () => {
  const alreadyCreated = await db.cities.findAll();
  if (alreadyCreated.length < list.length) {
    const itemsToCreate = list.filter((item) => {
      const created = alreadyCreated.find((dbItem) => dbItem.title === item.title);
      if (created) return null; // Item is already created, don't create it again
      return item;
    });
    if (itemsToCreate.length > 0) {
      await db.cities.bulkCreate(itemsToCreate);
    }
  }
  console.log('[seed] Cities: Sedeed successfully');
};

export default { seed };
