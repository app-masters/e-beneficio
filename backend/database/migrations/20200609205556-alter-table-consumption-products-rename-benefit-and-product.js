'use strict';

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Rename productsId to productId
      await queryInterface.removeConstraint('ConsumptionProducts', 'ConsumptionProducts_productsId_fkey', {
        transaction
      });
      await queryInterface.renameColumn('ConsumptionProducts', 'productsId', 'productId', { transaction });
      await queryInterface.addConstraint('ConsumptionProducts', ['productId'], {
        type: 'foreign key',
        name: 'ConsumptionProducts_productId_fkey',
        references: {
          table: 'Products',
          field: 'id'
        },
        transaction
      });

      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint('ConsumptionProducts', 'ConsumptionProducts_productId_fkey', {
        transaction
      });
      await queryInterface.renameColumn('ConsumptionProducts', 'productId', 'productsId', { transaction });
      await queryInterface.addConstraint('ConsumptionProducts', ['productsId'], {
        type: 'FOREIGN KEY',
        name: 'ConsumptionProducts_productsId_fkey',
        references: {
          table: 'Products',
          field: 'id'
        },
        transaction
      });

      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
