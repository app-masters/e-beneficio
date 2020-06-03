import db from '../../src/schemas';
import faker from 'faker/locale/pt_BR';
import logging from '../../src/utils/logging';
import { Dependent } from '../../src/schemas/depedents';

const nisPattern = '0123456789';

/**
 * Seed the place stores table
 */
const seed = async () => {
  try {
    const families = await db.families.findAll({ include: [{ model: db.dependents, as: 'dependents' }] });
    const dependentsToCreate: Dependent[] = [];
    families.forEach(async (family) => {
      // Check if the family has at least one dependent
      if (family.dependents && family.dependents.length < 2) {
        const lastName = faker.name.lastName();
        const numberOfDependents = 2;
        for (let i = 0; i < numberOfDependents; i++) {
          dependentsToCreate.push({
            familyId: family.id || 0,
            name: `${faker.name.firstName()} ${faker.name.lastName()} ${lastName}`.toLocaleUpperCase(),
            nis: new Array<string>(11)
              .fill('')
              .map(() => nisPattern[Math.floor(Math.random() * nisPattern.length)])
              .join(''),
            birthday: faker.date.past(10),
            schoolName: faker.company.companyName()
          });
        }
      }
    });
    const newDependents = await db.dependents.bulkCreate(dependentsToCreate);
    const dependentsCreated = newDependents.filter((dependent) => !!dependent).length;

    if (dependentsCreated > 0) {
      console.log(`[seed] Dependents: Seeded successfully - ${dependentsCreated} new created`);
    } else {
      console.log(`[seed] Dependents: Nothing to seed`);
    }
  } catch (error) {
    logging.error('[seed] Dependents: Failed to seed', error);
  }
};

export default { seed };
