import db from '../../src/schemas';
import { Consumption } from '../../src/schemas/consumptions';
import { Op } from 'sequelize';

const list = [
  {
    value: 29.87,
    invalidValue: 0,
    nfce:
      'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200519560168000260652020000215401387112952|2|1|1|038d7b68e58da7f62e8e70f94b093cf78baac165',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 42.67,
    invalidValue: 0,
    nfce:
      'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200517745613002528650020000196491545274393|2|1|1|d4c70111d8aa395e85a13dcab5bcd4d05f4fc925',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 17.97,
    invalidValue: 0,
    nfce:
      'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200517745613000908650030000582841783577460|2|1|1|b216ea61e1f6f458311ba2ec6fc05073ca8885fc',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 28.4,
    invalidValue: 0,
    nfce:
      'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200517144841000507650510000233971387980247|2|1|1|2eb1a022335f3f27acf629816bc9150431dac90c',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 92.55,
    invalidValue: 0,
    nfce:
      'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200503083231001176651070000059641802424994|2|1|1|5F114EE9DF02247F94F84D7B828C314293749828',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 51.63,
    invalidValue: 0,
    nfce:
      'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200517745613002102650250000512331819114371|2|1|1|482c7d14ced393860992342a969f624fce98d5d7',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 8.99,
    invalidValue: 0,
    nfce:
      'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200517745613002102650290000448711712971306|2|1|1|cf4303cd6386cbafdce876d1b1426de7da7610c7',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 32.09,
    invalidValue: 0,
    nfce:
      'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200517144841000507650500000769549388061411|2|1|25|32.09|6257677857396e517438696d557553317871464f717542716655493d|1|c55e0bf01e87c4a4e57ddf4ff07b0a7634f37e6b',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  },
  {
    value: 49.32,
    invalidValue: 0,
    nfce:
      'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200517144841000507650500000769539388061406|2|1|25|49.32|7072515544434763434a44427a666277303033395035486c4565633d|1|f85a87ab427e94bebc5d10e1956f76e097ef2d13',
    proofImageUrl: 'https://nstecnologia.com.br/blog/wp-content/uploads/2017/08/image2017-8-7-11-8-37.png'
  }
] as Consumption[];

/**
 * Generate a random consumption with nfce link following the pattern
 *
 * @returns a random consumption object
 */
const randomConsumption = () => {
  const firstPattern = '0123456789';
  const secondPattern = '0123456789abcdef';
  const baseURL = 'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml';
  const firstSequence = Array(38)
    .fill('')
    .map(() => firstPattern[Math.floor(Math.random() * firstPattern.length)])
    .join('');
  const secondSequence = Array(40)
    .fill('')
    .map(() => secondPattern[Math.floor(Math.random() * secondPattern.length)])
    .join('');
  return {
    value: Math.floor(Math.random() * 10000) / 100,
    nfce: `${baseURL}?p=312005${firstSequence}|2|1|1|${secondSequence}`
  };
};

/**
 * Seed the place stores table
 */
const seed = async () => {
  // Delete all consumptions that doesn't have a valid nfce link
  const deletedCount = await db.consumptions.destroy({
    where: { nfce: { [Op.notILike]: '%nfce.fazenda.mg.gov.br%' } }
  });
  if (deletedCount > 0) {
    console.log(`[seed] Consumptions: Invalid consumptions check - ${deletedCount} itens deleted`);
  }

  const alreadyCreated = await db.consumptions.findAll();

  const families = await db.families.findAll();
  const placeStores = await db.placeStores.findAll();
  const itemsToCreate = families
    .map((family, index) => {
      const created = alreadyCreated.find((dbItem) => dbItem.familyId === family.id);
      if (created) return null; // Item is already created, don't create it again
      const item = list[index % list.length];
      return {
        ...item,
        familyId: family.id,
        placeStoreId: placeStores[index % placeStores.length].id
      };
    })
    .filter(Boolean) as Consumption[];
  if (itemsToCreate.length > 0) {
    await db.consumptions.bulkCreate(itemsToCreate);
  }
  if (itemsToCreate.length > 0) {
    console.log(`[seed] Consumptions: Seeded successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] Consumptions: Nothing to seed`);
  }
};

export default { seed, randomConsumption };
