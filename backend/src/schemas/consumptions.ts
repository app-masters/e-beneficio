import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';
import { Product } from './products';
import { User } from './users';
import { ConsumptionProducts } from './consumptionProducts';

export interface PurchaseData {
  place?: string;
  totalValue?: number;
  payment: {
    name?: string;
    value?: number;
  }[];
  products: {
    name?: string;
    amount?: number;
    totalValue?: number;
  }[];
}

// Simple item type
export interface Consumption {
  readonly id?: number | string;
  familyId: number | string;
  placeStoreId?: number | string;
  nfce?: string;
  value?: number;
  invalidValue?: number;
  proofImageUrl?: string;
  reviewedAt?: number | Date | null;
  purchaseData?: PurchaseData;
  deletedBy?: User['id'];
  deleteReason?: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  //Join
  products?: (Product & { amount: number })[] | null;
  consumptionProducts?: ConsumptionProducts[];
}
// Sequelize returns type
export type SequelizeConsumption = Consumption & Model;
// Sequelize model type
export type SequelizeConsumptionModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizeConsumption;
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
  familyId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Families',
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
  nfce: {
    type: DataTypes.STRING,
    allowNull: true
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  invalidValue: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0.0
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  proofImageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  purchaseData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  deletedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      id: 'id'
    },
    allowNull: true
  },
  deleteReason: {
    type: DataTypes.STRING,
    allowNull: true
  }
};

const tableName = 'Consumptions';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initConsumptionSchema = (sequelize: Sequelize): SequelizeConsumptionModel => {
  const Schema = sequelize.define(tableName, attributes, {
    timestamps: true,
    paranoid: true // Soft-delete
  }) as SequelizeConsumptionModel;

  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.belongsTo(models.families, {
      foreignKey: 'familyId',
      as: 'family'
    });
    Schema.belongsTo(models.placeStores, {
      foreignKey: 'placeStoreId',
      as: 'placeStore'
    });
    Schema.hasMany(models.consumptionProducts, {
      foreignKey: 'consumptionsId',
      as: 'consumptionProducts'
    });
  };

  return Schema;
};
