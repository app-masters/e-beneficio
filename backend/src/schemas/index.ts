import { Sequelize, Options } from 'sequelize';
import { initCitySchema } from './cities';
import { initPlaceSchema } from './places';
import { initPlaceStoreSchema } from './placeStores';
import { initUserSchema } from './users';
import { initInstitutionSchema } from './institutions';
import { initBenefitSchema } from './benefits';
import { initFamilySchema } from './families';
import { initConsumptionSchema } from './consumptions';
import { initDependentSchema } from './depedents';

import * as config from '../../database/config';

const sequelize = new Sequelize(config as Options);

// List of Sequelize Models
const db = {
  cities: initCitySchema(sequelize),
  places: initPlaceSchema(sequelize),
  placeStores: initPlaceStoreSchema(sequelize),
  users: initUserSchema(sequelize),
  institutions: initInstitutionSchema(sequelize),
  benefits: initBenefitSchema(sequelize),
  families: initFamilySchema(sequelize),
  consumptions: initConsumptionSchema(sequelize),
  dependents: initDependentSchema(sequelize)
};

// Creating DB relations
Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

export { sequelize };

export default db;
