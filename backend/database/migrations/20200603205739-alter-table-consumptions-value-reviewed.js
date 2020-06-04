'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'Consumptions',
        'invalidValue',
        { type: Sequelize.FLOAT, allowNull: false },
        { transaction }
      );
      await queryInterface.addColumn(
        'Consumptions',
        'reviewedAt',
        { type: Sequelize.DATE, allowNull: true },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Consumptions', 'invalidValue', { transaction });
      await queryInterface.removeColumn('Consumptions', 'reviewedAt', { transaction });
      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  }
};
