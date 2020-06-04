'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('Consumptions', 'purchaseData', {
      type: Sequelize.JSON,
      allowNull: true
    }),

  down: (queryInterface) => queryInterface.removeColumn('Consumptions', 'purchaseData')
};
