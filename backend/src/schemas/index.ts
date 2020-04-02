import { Sequelize, Options } from 'sequelize';
import { initCitySchema } from './cities';
import { initPlaceSchema } from './places';
import { initPlaceStoreSchema } from './placeStores';
import { initUserSchema } from './users';
import { initInstitutionSchema } from './institutions';

import * as config from '../../database/config';

const sequelize = new Sequelize(config as Options);

// List of Sequelize Models
const db = {
  cities: initCitySchema(sequelize),
  places: initPlaceSchema(sequelize),
  placeStores: initPlaceStoreSchema(sequelize),
  users: initUserSchema(sequelize),
  institutions: initInstitutionSchema(sequelize)
};

// Creating DB relations
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
