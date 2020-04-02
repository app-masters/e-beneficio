import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';

// Simple item type
export interface Institution {
  readonly id?: number;
  cityId: number;
  title: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
// Sequelize returns type
export type SequelizeInstitution = Institution & Model;
// Sequelize model type
export type SequelizeInstitutionModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizeInstitution;
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
};

const tableName = 'Institutions';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initInstitutionSchema = (sequelize: Sequelize): SequelizeInstitutionModel => {
  const Schema = sequelize.define(tableName, attributes, { timestamps: true }) as SequelizeInstitutionModel;

  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.belongsTo(models.cities, {
      foreignKey: 'cityId',
      as: 'city'
    });
  };

  return Schema;
};
