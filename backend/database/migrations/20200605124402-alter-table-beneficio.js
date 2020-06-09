'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Benefits', 'year');
    queryInterface.removeColumn('Benefits', 'month');
    queryInterface.addColumn('Benefits', 'date', {
      type: Sequelize.DATE,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Benefits', 'date');
    queryInterface.addColumn('Benefits', 'year', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    queryInterface.addColumn('Benefits', 'month', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
