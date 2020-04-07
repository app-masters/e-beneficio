'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Families', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cityId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Cities',
          id: 'id'
        },
        allowNull: false
      },
      code: {
        type: Sequelize.STRING(11),
        allowNull: false
      },
      groupName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      responsibleName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      responsibleNis: {
        type: Sequelize.STRING(11),
        allowNull: false
      },
      responsibleBirthday: {
        type: Sequelize.DATE,
        allowNull: false
      },
      responsibleMotherName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    return queryInterface.dropTable('Families');
  }
};
