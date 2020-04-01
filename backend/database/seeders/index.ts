import citySeed from './cities';

/**
 * Seed all tables
 */
const seedAll = async () => {
  await citySeed.seed();
};

seedAll()
  .then(() => console.log('[seed] Finished: All tables seeded'))
  .catch(console.error);
