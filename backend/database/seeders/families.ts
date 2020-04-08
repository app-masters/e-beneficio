import db from '../../src/schemas';
import { Family } from '../../src/schemas/families';

const list = [
  {
    code: '10000000',
    groupName: 'extreme-poverty',
    responsibleName: 'JOSÉ ALMEIDA DA SILVA',
    responsibleBirthday: new Date(),
    responsibleNis: '10000000000',
    responsibleMotherName: 'MARIA RITA DA SILVA'
  },
  {
    code: '20000000',
    groupName: 'poverty-line',
    responsibleName: 'MARIA ARAÚJO',
    responsibleBirthday: new Date(),
    responsibleNis: '20000000000',
    responsibleMotherName: 'MARIA RITA DA SILVA'
  },
  {
    code: '30000000',
    groupName: 'cad',
    responsibleName: 'TEREZA DE JESUS',
    responsibleBirthday: new Date(),
    responsibleNis: '30000000000',
    responsibleMotherName: 'MARIA RITA DA SILVA'
  }
];

/**
 * Seed the place stores table
 */
const seed = async () => {
  const alreadyCreated = await db.families.findAll();
  if (alreadyCreated.length < list.length) {
    const cities = await db.cities.findAll();
    const itemsToCreate = list
      .map((item) => {
        const created = alreadyCreated.find((dbItem) => dbItem.code === item.code);
        if (created) return null; // Item is already created, don't create it again
        return { ...item, cityId: cities[0].id };
      })
      .filter(Boolean) as Family[];
    if (itemsToCreate.length > 0) {
      await db.families.bulkCreate(itemsToCreate);
    }
    console.log(`[seed] Families: Seeded successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] Families: Nothing to seed`);
  }
};

export default { seed };
