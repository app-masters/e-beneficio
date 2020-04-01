import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';

// Simple item type
export interface City {
  readonly id?: number;
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
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
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
    void models; // Remove this line and add the relations with other tables here
  };

  return Schema;
};
