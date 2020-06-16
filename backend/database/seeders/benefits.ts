import db from '../../src/schemas';
import { Benefit } from '../../src/schemas/benefits';
import moment from 'moment';
import { getFamilyGroupByCode } from '../../src/utils/constraints';

const list = [
  {
    title: '[CAD25123] Auxilio municipal de alimentação',
    groupId: getFamilyGroupByCode(3).id,
    date: moment().startOf('month').toDate(),
    institutionId: 1,
    value: 1000
  },
  {
    title: '[CAD25123] Auxilio municipal de alimentação',
    groupId: getFamilyGroupByCode(1).id,
    date: moment().startOf('month').toDate(),
    institutionId: 1,
    value: 2000
  },
  {
    title: '[CAD25123] Auxilio municipal de alimentação',
    groupId: getFamilyGroupByCode(2).id,
    date: moment().startOf('month').toDate(),
    institutionId: 1,
    value: 500
  },
  {
    title: '[CAD25123] Auxilio municipal de merenda',
    groupId: getFamilyGroupByCode(0).id,
    date: moment().startOf('month').toDate(),
    institutionId: 1,
    value: 100
  }
] as Benefit[];

/**
 * Seed the benefits table
 */
const seed = async () => {
  const alreadyCreated = await db.benefits.findAll();
  if (alreadyCreated.length < list.length) {
    const institutions = await db.institutions.findAll();
    const itemsToCreate = list
      .map((item, index) => {
        const created = alreadyCreated.find((dbItem) => dbItem.title === item.title);
        if (created) return null; // Item is already created, don't create it again
        const institutionIndex = index % institutions.length; // Getting a cityId from the list
        return { ...item, institutionId: institutions[institutionIndex].id };
      })
      .filter(Boolean) as Benefit[];
    if (itemsToCreate.length > 0) {
      await db.benefits.bulkCreate(itemsToCreate);
    }
    console.log(`[seed] Benefits: Seeded successfully - ${itemsToCreate.length} new created`);
  } else {
    console.log(`[seed] Benefits: Nothing to seed`);
  }
};

export default { seed, groupList: list };
