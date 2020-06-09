import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';
import { Product } from './products';
import { Benefit } from './benefits';

// Simple item type
export interface BenefitProduct {
  readonly id?: number | string;
  productsId: number | string;
  benefitsId: number | string;
  amount: number;
  products: Product | null;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  //Join
  products?: Product[];
  benefits?: Benefit[];
}
// Sequelize returns type
export type SequelizeBenefitProduct = BenefitProduct & Model;
// Sequelize model type
export type SequelizeBenefitProductModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizeBenefitProduct;
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
  productsId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Products',
      id: 'id'
    },
    allowNull: false
  },
  benefitsId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Benefits',
      id: 'id'
    },
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
};

const tableName = 'BenefitProducts';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initBenefitProductSchema = (sequelize: Sequelize): SequelizeBenefitProductModel => {
  const Schema = sequelize.define(tableName, attributes, { timestamps: true }) as SequelizeBenefitProductModel;

  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.belongsTo(models.products, {
      foreignKey: 'productsId',
      as: 'products'
    });
    //
    Schema.belongsTo(models.benefits, {
      foreignKey: 'benefitsId',
      as: 'benefits'
    });
  };

  return Schema;
};
