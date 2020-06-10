'use strict';

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Rename productsId to productId
      await queryInterface.removeConstraint('BenefitProducts', 'BenefitProducts_productsId_fkey', { transaction });
      await queryInterface.renameColumn('BenefitProducts', 'productsId', 'productId', { transaction });
      await queryInterface.addConstraint('BenefitProducts', ['productId'], {
        type: 'foreign key',
        name: 'BenefitProducts_productId_fkey',
        references: {
          table: 'Products',
          field: 'id'
        },
        transaction
      });

      // Rename benefitsId to benefitId
      await queryInterface.removeConstraint('BenefitProducts', 'BenefitProducts_benefitsId_fkey', { transaction });
      await queryInterface.renameColumn('BenefitProducts', 'benefitsId', 'benefitId', { transaction });
      await queryInterface.addConstraint('BenefitProducts', ['benefitId'], {
        type: 'foreign key',
        name: 'BenefitProducts_benefitId_fkey',
        references: {
          table: 'Benefits',
          field: 'id'
        },
        onDelete: 'cascade',
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
      await queryInterface.removeConstraint('BenefitProducts', 'BenefitProducts_productId_fkey', { transaction });
      await queryInterface.renameColumn('BenefitProducts', 'productId', 'productsId', { transaction });
      await queryInterface.addConstraint('BenefitProducts', ['productsId'], {
        type: 'FOREIGN KEY',
        name: 'BenefitProducts_productsId_fkey',
        references: {
          table: 'Products',
          field: 'id'
        },
        transaction
      });

      // Rename benefitId benefitsId
      await queryInterface.removeConstraint('BenefitProducts', 'BenefitProducts_benefitId_fkey', { transaction });
      await queryInterface.renameColumn('BenefitProducts', 'benefitId', 'benefitsId', { transaction });
      await queryInterface.addConstraint('BenefitProducts', ['benefitsId'], {
        type: 'foreign key',
        name: 'BenefitProducts_benefitsId_fkey',
        references: {
          table: 'Benefits',
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
