'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('Benefits', 'value', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('Benefits', 'value', {
      type: Sequelize.FLOAT,
      allowNull: false
    });
  }
};
