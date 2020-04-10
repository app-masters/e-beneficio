import cities from './cities';
import places from './places';
import placeStores from './placeStores';
import users from './users';
import institutions from './institutions';
import benefits from './benefits';
import families from './families';
import consumptions from './consumptions';

/**
 * Seed all tables
 */
const seedAll = async () => {
  // Development seed
  if (process.env.NODE_ENV === 'development') {
    await cities.seed();
    await places.seed();
    await placeStores.seed();
    await users.seed();
    await institutions.seed();
    await benefits.seed();
    await families.seed();
    await consumptions.seed();
    await families.csv(); // CSV example seed
  }
  // Production seed
  // ...
};

console.log('[seed] Started ---');
const startTime = new Date().getTime();
seedAll()
  .then(() => console.log(`[seed] Finished: All tables seeded -- Time spent: ${new Date().getTime() - startTime}ms`))
  .catch(console.error);
