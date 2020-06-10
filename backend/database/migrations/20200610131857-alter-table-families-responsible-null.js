'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      queryInterface.changeColumn('Families', 'responsibleName', {
        type: Sequelize.STRING,
        allowNull: true
      });
      queryInterface.changeColumn('Families', 'responsibleNis', {
        type: Sequelize.STRING(11),
        allowNull: true
      });
      queryInterface.changeColumn('Families', 'responsibleBirthday', {
        type: Sequelize.DATE,
        allowNull: true
      });
      queryInterface.changeColumn('Families', 'responsibleMotherName', {
        type: Sequelize.STRING,
        allowNull: true
      });
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
      queryInterface.changeColumn('Families', 'responsibleName', {
        type: Sequelize.STRING,
        allowNull: false
      });
      queryInterface.changeColumn('Families', 'responsibleNis', {
        type: Sequelize.STRING(11),
        allowNull: false
      });
      queryInterface.changeColumn('Families', 'responsibleBirthday', {
        type: Sequelize.DATE,
        allowNull: false
      });
      queryInterface.changeColumn('Families', 'responsibleMotherName', {
        type: Sequelize.STRING,
        allowNull: false
      });
      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  }
};
