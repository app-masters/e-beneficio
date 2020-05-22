import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';

// Simple item type
export interface Dependent {
  readonly id?: number | string;
  familyId: number | string;
  name: string;
  nis: string;
  birthday: Date | string;
  schoolName?: string;
  deactivatedAt?: number | Date | null;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
// Sequelize returns type
export type SequelizeDependent = Dependent & Model;
// Sequelize model type
export type SequelizeDependentModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizeDependent;
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nis: {
    type: DataTypes.STRING,
    allowNull: false
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: false
  },
  schoolName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deactivatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
};

const tableName = 'Dependents';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initDependentSchema = (sequelize: Sequelize): SequelizeDependentModel => {
  const Schema = sequelize.define(tableName, attributes, { timestamps: true }) as SequelizeDependentModel;

  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.belongsTo(models.families, {
      foreignKey: 'familyId',
      as: 'family'
    });
  };

  return Schema;
};
