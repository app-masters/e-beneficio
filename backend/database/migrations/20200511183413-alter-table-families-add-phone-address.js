'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'Families',
        'phone',
        {
          type: Sequelize.STRING,
          allowNull: true
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'Families',
        'address',
        {
          type: Sequelize.STRING,
          allowNull: true
        },
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
      await queryInterface.removeColumn('Families', 'address', { transaction });
      await queryInterface.removeColumn('Families', 'phone', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw err;
    }
  }
};
