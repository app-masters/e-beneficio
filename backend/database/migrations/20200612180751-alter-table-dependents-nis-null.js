'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn('Dependents', 'nis', { type: Sequelize.STRING, allowNull: true });
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
      await queryInterface.changeColumn('Dependents', 'nis', { type: Sequelize.STRING, allowNull: false });
      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  }
};
