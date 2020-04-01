import { Sequelize, Options } from 'sequelize';
import { initCitySchema } from './city';

import * as config from '../../database/config';

const sequelize = new Sequelize(config as Options);

// List of Sequelize Models
const db = {
  cities: initCitySchema(sequelize)
};

// Creating DB relations
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
