import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';

// Simple item type
export interface Benefit {
  readonly id?: number | string;
  institutionId: number | string;
  groupName: string;
  title: string;
  month: number;
  year: number;
  value?: number;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
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
  month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
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
  };

  return Schema;
};
