'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'Families',
        'phone2',
        { type: Sequelize.STRING, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Families',
        'deactivatedAt',
        { type: Sequelize.DATE, allowNull: true },
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
      await queryInterface.removeColumn('Families', 'phone2', { transaction });
      await queryInterface.removeColumn('Families', 'deactivatedAt', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw err;
    }
  }
};
