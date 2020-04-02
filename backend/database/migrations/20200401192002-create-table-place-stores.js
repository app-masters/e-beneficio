'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('PlaceStores', {
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
      placeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Places',
          id: 'id'
        },
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cnpj: {
        type: Sequelize.STRING(50),
        allowNull: true
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
    return queryInterface.dropTable('PlaceStores');
  }
};
