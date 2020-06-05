'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('BenefitProducts', {
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
      benefitsId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Benefits',
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
    return queryInterface.dropTable('BenefitProducts');
  }
};
