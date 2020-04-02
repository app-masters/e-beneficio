import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';

// Simple item type
export interface PlaceStore {
  readonly id?: number;
  title: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
// Sequelize returns type
export type SequelizePlaceStore = PlaceStore & Model;
// Sequelize model type
export type SequelizePlaceStoreModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizePlaceStore;
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

const tableName = 'PlaceStores';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initPlaceStoreSchema = (sequelize: Sequelize): SequelizePlaceStoreModel => {
  const Schema = sequelize.define(tableName, attributes, { timestamps: true }) as SequelizePlaceStoreModel;

  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.belongsTo(models.cities, {
      foreignKey: 'cityId',
      as: 'city'
    });
    Schema.belongsTo(models.places, {
      foreignKey: 'placeId',
      as: 'place'
    });
  };

  return Schema;
};
