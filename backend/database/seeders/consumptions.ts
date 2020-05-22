import db from '../../src/schemas';
import { Consumption } from '../../src/schemas/consumptions';

const list = [
  {
    value: 50,
    nfce: '00001',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 10.49,
    nfce: '00002',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 29.99,
    nfce: '00003',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 60.25,
    nfce: '00004',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 60.25,
    nfce: '00005',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 60.25,
    nfce: '00006',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 60.25,
    nfce: '00007',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 60.25,
    nfce: '00008',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  }
] as Consumption[];

/**
 * Seed the place stores table
 */
const seed = async () => {
  const alreadyCreated = await db.consumptions.findAll();
  if (alreadyCreated.length < list.length) {
    const families = await db.families.findAll();
    const placeStores = await db.placeStores.findAll();
    const itemsToCreate = list
      .map((item, index) => {
        const created = alreadyCreated.find((dbItem) => dbItem.nfce === item.nfce);
        if (created) return null; // Item is already created, don't create it again
        return {
          ...item,
          familyId: families[index % families.length].id,
          placeStoreId: placeStores[index % placeStores.length].id
        };
      })
      .filter(Boolean) as Consumption[];
    if (itemsToCreate.length > 0) {
      await db.consumptions.bulkCreate(itemsToCreate);
    }
    console.log(`[seed] Consumptions: Seeded successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] Consumptions: Nothing to seed`);
  }
};

export default { seed };
