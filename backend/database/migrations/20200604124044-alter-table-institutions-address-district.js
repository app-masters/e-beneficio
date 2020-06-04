'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'Institutions',
        'address',
        { type: Sequelize.STRING, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Institutions',
        'district',
        { type: Sequelize.STRING, allowNull: true },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // SupCourses
      await queryInterface.removeColumn('Institution', 'address', { transaction });
      await queryInterface.removeColumn('Institution', 'district', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw err;
    }
  }
};
