import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';

// Simple item type
export interface Place {
  readonly id?: number;
  title: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
// Sequelize returns type
export type SequelizePlace = Place & Model;
// Sequelize model type
export type SequelizePlaceModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizePlace;
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

const tableName = 'Places';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initPlaceSchema = (sequelize: Sequelize): SequelizePlaceModel => {
  const Schema = sequelize.define(tableName, attributes, { timestamps: true }) as SequelizePlaceModel;

  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.belongsTo(models.cities, {
      foreignKey: 'cityId',
      as: 'city'
    });
    Schema.hasMany(models.placeStores, {
      foreignKey: 'placeId',
      as: 'placeStores'
    });
  };

  return Schema;
};
