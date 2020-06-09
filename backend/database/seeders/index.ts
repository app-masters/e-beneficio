import { sequelize } from '../../src/schemas';
import cities from './cities';
import places from './places';
import placeStores from './placeStores';
import users from './users';
import institutions from './institutions';
import benefits from './benefits';
import families from './families';
import consumptions from './consumptions';
import dependents from './dependents';
import products from './products';
import benefitsProducts from './benefitsProducts';

/**
 * Seed all tables
 */
const seedAll = async () => {
  if (process.env.NODE_ENV === 'development') {
    // Development seed
    await cities.seed();
    await places.seed();
    await placeStores.seed();
    await users.seed();
    await institutions.seed();
    await benefits.seed();
    await families.seed();
    await dependents.seed();
    await consumptions.seed();
    await products.seed();
    await benefitsProducts.seed();
  } else {
    // Production seed - one city and admin user
    await cities.seed();
    await users.seedAdmin();
  }
};

console.log('[seed] Started ---');
const startTime = new Date().getTime();
seedAll()
  .then(() => {
    console.log(`[seed] Finished: All tables seeded -- Time spent: ${new Date().getTime() - startTime}ms`);
    sequelize.close();
  })
  .catch((error) => {
    console.error(error);
    process.exit();
  });
