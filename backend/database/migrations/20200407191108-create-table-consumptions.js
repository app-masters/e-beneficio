'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Consumptions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      familyId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Families',
          id: 'id'
        },
        allowNull: false
      },
      placeStoreId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'PlaceStores',
          id: 'id'
        },
        allowNull: false
      },
      nfce: {
        type: Sequelize.STRING,
        allowNull: false
      },
      value: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      proofImageUrl: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable('Consumptions');
  }
};
