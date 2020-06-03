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

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // SupCourses
      await queryInterface.removeColumn('Consumptions', 'invalidValue');
      await queryInterface.removeColumn('Consumptions', 'reviewedAt');
      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  }
};
