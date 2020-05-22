'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Consumptions', 'placeStoreId');
      await queryInterface.addColumn(
        'Consumptions',
        'placeStoreId',
        { type: Sequelize.INTEGER, references: { model: 'PlaceStores', id: 'id' }, allowNull: true },
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
      await queryInterface.removeColumn('Consumptions', 'placeStoreId');
      await queryInterface.addColumn(
        'Consumptions',
        'placeStoreId',
        { type: Sequelize.INTEGER, references: { model: 'PlaceStores', id: 'id' }, allowNull: false },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  }
};
