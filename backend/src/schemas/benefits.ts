import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';
import { BenefitProduct } from './benefitProducts';

// Simple item type
export interface Benefit {
  readonly id?: number | string;
  institutionId: number | string;
  groupName: string;
  title: string;
  date: Date;
  value?: number;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  //Join
  benefitProducts?: BenefitProduct[];
}
// Sequelize returns type
export type SequelizeBenefit = Benefit & Model;
// Sequelize model type
export type SequelizeBenefitModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizeBenefit;
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
  institutionId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Institutions',
      id: 'id'
    },
    allowNull: false
  },
  groupName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: true
  }
};

const tableName = 'Benefits';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initBenefitSchema = (sequelize: Sequelize): SequelizeBenefitModel => {
  const Schema = sequelize.define(tableName, attributes, { timestamps: true }) as SequelizeBenefitModel;

  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.belongsTo(models.institutions, {
      foreignKey: 'institutionId',
      as: 'institution'
    });
    Schema.hasMany(models.benefitProducts, {
      foreignKey: 'benefitId',
      as: 'benefitProducts',
      onDelete: 'CASCADE',
      hooks: true
    });
  };

  return Schema;
};
