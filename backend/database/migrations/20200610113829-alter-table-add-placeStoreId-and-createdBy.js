'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'Families',
        'placeStoreId',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'PlaceStores',
            id: 'id'
          }
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'Families',
        'createdById',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Users',
            id: 'id'
          }
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
      await queryInterface.removeColumn('Families', 'createdById', { transaction });
      await queryInterface.removeColumn('Families', 'placeStoreId', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw err;
    }
  }
};
