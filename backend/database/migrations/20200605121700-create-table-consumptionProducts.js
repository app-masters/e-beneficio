'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('ConsumptionProducts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      productsId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Products',
          id: 'id'
        },
        allowNull: false
      },
      consumptionsId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Consumptions',
          id: 'id'
        },
        allowNull: false
      },
      amount: {
        type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('ConsumptionProducts');
  }
};
