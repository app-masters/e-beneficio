import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';

// Simple item type
export interface User {
  readonly id?: number;
  cityId: number;
  placeStoreId?: number;
  name?: string;
  cpf: string;
  role: string;
  email?: string;
  password: string;
  active: boolean;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
// Sequelize returns type
export type SequelizeUser = User & Model;
// Sequelize model type
export type SequelizeUserModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizeUser;
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
  placeStoreId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'PlaceStores',
      id: 'id'
    },
    allowNull: true
  },
  cpf: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
};

const tableName = 'Users';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initUserSchema = (sequelize: Sequelize): SequelizeUserModel => {
  const Schema = sequelize.define(tableName, attributes, { timestamps: true }) as SequelizeUserModel;

  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.belongsTo(models.cities, {
      foreignKey: 'cityId',
      as: 'city'
    });
    Schema.belongsTo(models.placeStores, {
      foreignKey: 'placeStoreId',
      as: 'placeStore'
    });
  };

  return Schema;
};
