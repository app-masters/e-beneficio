import { sequelize } from '../src/schemas';
import logging from '../src/utils/logging';

/**
 * Recreate the database, deleting the default schema and creating again
 */
const recreate = async () => {
  try {
    console.log('Recreating database...');
    await sequelize.query('DROP SCHEMA public CASCADE');
    await sequelize.query('CREATE SCHEMA public');
    console.log('Database recreated');
  } catch (e) {
    logging.critical('Failed to recreate database', e);
  }
  process.exit(0);
};

if (process.env.NODE_ENV === 'production') {
  logging.critical('Trying recreate database on production!!');
  process.exit(0);
}

recreate();
