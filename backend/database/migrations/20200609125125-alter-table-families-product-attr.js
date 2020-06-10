'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'Families',
        'isRegisteredInPerson',
        { type: Sequelize.BOOLEAN, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Families',
        'totalSalary',
        { type: Sequelize.FLOAT, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Families',
        'isOnAnotherProgram',
        { type: Sequelize.BOOLEAN, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Families',
        'isOnGovernProgram',
        { type: Sequelize.BOOLEAN, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Families',
        'houseType',
        { type: Sequelize.STRING, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Families',
        'numberOfRooms',
        { type: Sequelize.INTEGER, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Families',
        'haveSewage',
        { type: Sequelize.BOOLEAN, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Families',
        'sewageComment',
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
      await queryInterface.removeColumn('Families', 'isRegisteredInPerson', { transaction });
      await queryInterface.removeColumn('Families', 'totalSalary', { transaction });
      await queryInterface.removeColumn('Families', 'isOnAnotherProgram', { transaction });
      await queryInterface.removeColumn('Families', 'isOnGovernProgram', { transaction });
      await queryInterface.removeColumn('Families', 'houseType', { transaction });
      await queryInterface.removeColumn('Families', 'numberOfRooms', { transaction });
      await queryInterface.removeColumn('Families', 'haveSewage', { transaction });
      await queryInterface.removeColumn('Families', 'sewageComment', { transaction });

      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  }
};
