import { Sequelize, Model, DataTypes, BuildOptions, ModelCtor } from 'sequelize';
import { Dependent } from './depedents';
import { Consumption } from './consumptions';

// Simple item type
export interface Family {
  readonly id?: number | string;
  cityId: number | string;
  code: string;
  groupId: number | string;
  responsibleName?: string;
  responsibleNis?: string;
  responsibleBirthday?: Date;
  responsibleMotherName?: string;
  address?: string;
  phone?: string;
  phone2?: string;
  deactivatedAt?: number | Date | null;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  //New attributes
  isRegisteredInPerson?: boolean;
  totalSalary?: number;
  isOnAnotherProgram?: boolean;
  isOnGovernProgram?: boolean;
  houseType?: string;
  numberOfRooms?: number;
  haveSewage?: boolean;
  sewageComment?: string;
  createdById?: number | string;
  placeStoreId?: number | string;
  // Join
  dependents?: Dependent[];
  consumptions?: Consumption[];
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
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Groups',
      id: 'id'
    }
  },
  responsibleName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  responsibleNis: {
    type: DataTypes.STRING(11),
    allowNull: true
  },
  responsibleBirthday: {
    type: DataTypes.DATE,
    allowNull: true
  },
  responsibleMotherName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone2: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deactivatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isRegisteredInPerson: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  totalSalary: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  isOnAnotherProgram: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  isOnGovernProgram: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  houseType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numberOfRooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  haveSewage: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  sewageComment: {
    type: DataTypes.STRING,
    allowNull: true
  },
  placeStoreId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'PlaceStores',
      id: 'id'
    }
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      id: 'id'
    }
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
    Schema.hasMany(models.consumptions, {
      foreignKey: 'familyId',
      as: 'consumptions'
    });
    Schema.hasMany(models.dependents, {
      foreignKey: 'familyId',
      as: 'dependents'
    });
    Schema.belongsTo(models.placeStores, {
      foreignKey: 'placeStoreId',
      as: 'placeStore'
    });
    Schema.belongsTo(models.users, {
      foreignKey: 'createdById',
      as: 'createdBy'
    });
    Schema.belongsTo(models.groups, {
      foreignKey: 'groupId',
      as: 'group'
    });
  };

  return Schema;
};
