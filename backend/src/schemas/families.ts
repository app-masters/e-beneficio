import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';

// Simple item type
export interface Family {
  readonly id?: number | string;
  cityId: number | string;
  code: string;
  groupName: string;
  responsibleName: string;
  responsibleNis: string;
  responsibleBirthday: Date;
  responsibleMotherName: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
// Sequelize returns type
export type SequelizeFamily = Family & Model;
// Sequelize model type
export type SequelizeFamilyModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizeFamily;
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
  code: {
    type: DataTypes.STRING(11),
    allowNull: false
  },
  groupName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  responsibleName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  responsibleNis: {
    type: DataTypes.STRING(11),
    allowNull: false
  },
  responsibleBirthday: {
    type: DataTypes.DATE,
    allowNull: false
  },
  responsibleMotherName: {
    type: DataTypes.STRING,
    allowNull: false
  }
};

const tableName = 'Families';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initFamilySchema = (sequelize: Sequelize): SequelizeFamilyModel => {
  const Schema = sequelize.define(tableName, attributes, { timestamps: true }) as SequelizeFamilyModel;

  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.belongsTo(models.cities, {
      foreignKey: 'cityId',
      as: 'city'
    });
  };

  return Schema;
};
