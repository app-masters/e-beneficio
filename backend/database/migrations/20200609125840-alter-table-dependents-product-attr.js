'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Dependents', 'rg', { type: Sequelize.STRING, allowNull: true }, { transaction });
      await queryInterface.addColumn('Dependents', 'cpf', { type: Sequelize.STRING, allowNull: true }, { transaction });
      await queryInterface.addColumn(
        'Dependents',
        'phone',
        { type: Sequelize.STRING, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Dependents',
        'profession',
        { type: Sequelize.STRING, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Dependents',
        'isHired',
        { type: Sequelize.BOOLEAN, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Dependents',
        'isFormal',
        { type: Sequelize.BOOLEAN, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Dependents',
        'salary',
        { type: Sequelize.FLOAT, allowNull: true },
        { transaction }
      );
      await queryInterface.addColumn(
        'Dependents',
        'email',
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
      await queryInterface.removeColumn('Dependents', 'rg', { transaction });
      await queryInterface.removeColumn('Dependents', 'cpf', { transaction });
      await queryInterface.removeColumn('Dependents', 'phone', { transaction });
      await queryInterface.removeColumn('Dependents', 'profession', { transaction });
      await queryInterface.removeColumn('Dependents', 'isHired', { transaction });
      await queryInterface.removeColumn('Dependents', 'isFormal', { transaction });
      await queryInterface.removeColumn('Dependents', 'salary', { transaction });
      await queryInterface.removeColumn('Dependents', 'email', { transaction });

      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  }
};
