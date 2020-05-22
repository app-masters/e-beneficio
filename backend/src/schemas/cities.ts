import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';

// Simple item type
export interface City {
  readonly id?: number | string;
  title: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
// Sequelize returns type
export type SequelizeCity = City & Model;
// Sequelize model type
export type SequelizeCityModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizeCity;
  associate: (models: { [key: string]: ModelCtor<Model> }) => void;
};

/**
 * Sequelize attributes for this table
 */
export const attributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
};

const tableName = 'Cities';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initCitySchema = (sequelize: Sequelize): SequelizeCityModel => {
  const Schema = sequelize.define(tableName, attributes, { timestamps: true }) as SequelizeCityModel;

  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.hasMany(models.places, {
      foreignKey: 'cityId',
      as: 'places'
    });
    Schema.hasMany(models.placeStores, {
      foreignKey: 'cityId',
      as: 'placeStores'
    });
    Schema.hasMany(models.users, {
      foreignKey: 'cityId',
      as: 'users'
    });
    Schema.hasMany(models.institutions, {
      foreignKey: 'cityId',
      as: 'institutions'
    });
    Schema.hasMany(models.families, {
      foreignKey: 'cityId',
      as: 'families'
    });
  };

  return Schema;
};
