'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('PlaceStores', 'responsibleName', { type: Sequelize.STRING, allowNull: true });
      await queryInterface.addColumn('PlaceStores', 'responsibleEmail', { type: Sequelize.STRING, allowNull: true });
      await queryInterface.addColumn('PlaceStores', 'responsiblePhone', { type: Sequelize.STRING, allowNull: true });
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
      await queryInterface.removeColumn('PlaceStores', 'responsibleName');
      await queryInterface.removeColumn('PlaceStores', 'responsibleEmail');
      await queryInterface.removeColumn('PlaceStores', 'responsiblePhone');
      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  }
};
