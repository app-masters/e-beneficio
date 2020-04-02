'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Places', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cityId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Cities',
          id: 'id'
        },
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
    return queryInterface.dropTable('Places');
  }
};
