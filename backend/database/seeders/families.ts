import db from '../../src/schemas';
import { Family } from '../../src/schemas/families';
import moment from 'moment';
import { importFamilyFromCadAndSislameCSV } from '../../src/models/families';

const list = [
  {
    code: '10000000',
    groupName: 'extreme-poverty',
    responsibleName: 'JOSÉ ALMEIDA DA SILVA',
    responsibleBirthday: moment('01/01/1988', 'DD/MM/YYYY').toDate(),
    responsibleNis: '10000000000',
    responsibleMotherName: 'MARIA RITA DA SILVA'
  },
  {
    code: '20000000',
    groupName: 'poverty-line',
    responsibleName: 'MARIA ARAÚJO',
    responsibleBirthday: moment('06/07/1979', 'DD/MM/YYYY').toDate(),
    responsibleNis: '20000000000',
    responsibleMotherName: 'MARIA RITA DA SILVA'
  },
  {
    code: '30000000',
    groupName: 'cad',
    responsibleName: 'TEREZA DE JESUS',
    responsibleBirthday: moment('01/10/1978', 'DD/MM/YYYY').toDate(),
    responsibleNis: '30000000000',
    responsibleMotherName: 'MARIA RITA DA SILVA'
  },
  {
    code: '1234',
    groupName: 'cad',
    responsibleName: 'JOÃO FERNANDO BARAKY',
    responsibleBirthday: moment('20/12/1991', 'DD/MM/YYYY').toDate(),
    responsibleNis: '1234',
    responsibleMotherName: 'HILDA LÚCIA BARAKY'
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
