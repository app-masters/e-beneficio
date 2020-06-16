import db from '../../src/schemas';
import { Group } from '../../src/schemas/groups';

const list = [
  { title: 'Bolsa família com filho na escola pública' },
  { title: 'Extrema pobreza' },
  { title: 'Linha da pobreza' },
  { title: 'Perfil CAD único' }
];

/**
 * Seed the groups table
 */
const seed = async () => {
  const alreadyCreated = await db.groups.findAll();
  if (alreadyCreated.length < list.length) {
    const itemsToCreate = list.filter((item) => {
      const created = alreadyCreated.find((dbItem) => dbItem.title === item.title);
      if (created) return null; // Item is already created, don't create it again
      return item;
    });
    if (itemsToCreate.length > 0) {
      await itemsToCreate
        .map((item) => () => db.groups.create(item))
        .reduce(
          (promise, fn) => promise.then((result) => fn().then(Array.prototype.concat.bind(result))),
          Promise.resolve([] as Group[])
        );
    }
    console.log(`[seed] Groups: Seeded successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] Groups: Nothing to seed`);
  }
};

export default { seed };
