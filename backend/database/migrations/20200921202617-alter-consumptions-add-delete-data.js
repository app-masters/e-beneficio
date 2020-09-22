'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'Consumptions',
        'deletedBy',
        { type: Sequelize.INTEGER, references: { model: 'Users', id: 'id' }, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Consumptions',
        'deleteReason',
        { type: Sequelize.STRING, allowNull: true },
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
      await queryInterface.removeColumn('Consumptions', 'deleteReason');
      await queryInterface.removeColumn('Consumptions', 'deletedBy');
      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  }
};
