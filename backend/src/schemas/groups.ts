import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';

// Simple item type
export interface Group {
  readonly id?: number | string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
// Sequelize returns type
export type SequelizeGroup = Group & Model;
// Sequelize model type
export type SequelizeGroupModel = typeof Model & {
  new (values?: object, options?: BuildOptions): SequelizeGroup;
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
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

const tableName = 'Groups';

/**
 * Sequelize model initializer function
 * @param sequelize - Sequelize instance
 * @returns Schema - Sequelize model
 */
export const initGroupSchema = (sequelize: Sequelize): SequelizeGroupModel => {
  const Schema = sequelize.define(tableName, attributes, { timestamps: true }) as SequelizeGroupModel;

  // Sequelize relations
  Schema.associate = (models): void => {
    // Sequelize relations
    Schema.hasMany(models.families, {
      foreignKey: 'groupId',
      as: 'families'
    });
    Schema.hasMany(models.benefits, {
      foreignKey: 'groupId',
      as: 'benefits'
    });
  };

  return Schema;
};
