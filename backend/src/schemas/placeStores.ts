import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';
import { Family } from './families';

// Simple item type
export interface PlaceStore {
  readonly id?: number | string;
  cityId: number | string;
  placeId: number | string;
  title: string;
  address: string;
  cnpj: string;
  responsibleName?: string;
  responsiblePhone?: string;
  responsibleEmail?: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  //Join
  families: Family[];
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
  cityId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Cities',
      id: 'id'
    },
    allowNull: false
  },
  placeId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Places',
      id: 'id'
    },
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cnpj: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  responsibleName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  responsiblePhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  responsibleEmail: {
    type: DataTypes.STRING,
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
    Schema.hasMany(models.users, {
      foreignKey: 'placeStoreId',
      as: 'users'
    });
    Schema.hasMany(models.consumptions, {
      foreignKey: 'placeStoreId',
      as: 'consumptions'
    });
    Schema.hasMany(models.families, {
      foreignKey: 'placeStoreId',
      as: 'families'
    });
  };

  return Schema;
};
