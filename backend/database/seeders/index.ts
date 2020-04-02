import citySeed from './cities';
import placeSeed from './places';
import placeStoreSeed from './placeStores';
import userSeed from './users';
import institutionSeed from './institutions';
import benefitSeed from './benefits';

/**
 * Seed all tables
 */
const seedAll = async () => {
  // Development seed
  if (process.env.NODE_ENV === 'development') {
    await citySeed.seed();
    await placeSeed.seed();
    await placeStoreSeed.seed();
    await userSeed.seed();
    await institutionSeed.seed();
    await benefitSeed.seed();
  }
  // Production seed
  // ...
};

console.log('[seed] Started ---');
const startTime = new Date().getTime();
seedAll()
  .then(() => console.log(`[seed] Finished: All tables seeded -- Time spent: ${new Date().getTime() - startTime}ms`))
  .catch(console.error);
