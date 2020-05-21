'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('Consumptions', 'nfce', {
      type: Sequelize.STRING,
      allowNull: true
    }),

  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('Consumptions', 'nfce', {
      type: Sequelize.STRING,
      allowNull: false
    })
};
