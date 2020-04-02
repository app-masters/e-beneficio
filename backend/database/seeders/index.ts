import citySeed from './cities';
import placeSeed from './places';
import placeStoreSeed from './placeStores';

/**
 * Seed all tables
 */
const seedAll = async () => {
  // Development seed
  if (process.env.NODE_ENV === 'development') {
    await citySeed.seed();
    await placeSeed.seed();
    await placeStoreSeed.seed();
  }
  // Production seed
  // ...
};

seedAll()
  .then(() => console.log('[seed] Finished: All tables seeded'))
  .catch(console.error);
