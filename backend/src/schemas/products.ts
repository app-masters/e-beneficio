import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';

// Simple item type
export interface Product {
  readonly id?: number | string;
  name: string;
  isValid?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
// Sequelize returns type
export type SequelizeProduct = Product & Model;
// Sequelize model type
export type SequelizeProductModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizeProduct;
  associate?: (models: { [key: string]: ModelCtor<Model> }) => void;
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isValid: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null
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

const tableName = 'Products';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initProductSchema = (sequelize: Sequelize): SequelizeProductModel => {
  const Schema = sequelize.define(tableName, attributes, { timestamps: true }) as SequelizeProductModel;

  // Sequelize relations
  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.hasMany(models.consumptionProducts, {
      foreignKey: 'productsId',
      as: 'consumptionProducts'
    });
    Schema.hasMany(models.benefitProducts, {
      foreignKey: 'productsId',
      as: 'benefitProduct'
    });
  };

  return Schema;
};
