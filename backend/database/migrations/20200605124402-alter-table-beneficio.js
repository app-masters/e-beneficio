'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // The column needs to allow null as the column does not have and defualt value
      await queryInterface.addColumn(
        'Benefits',
        'date',
        {
          type: Sequelize.DATE
        },
        { transaction }
      );
      // Generate a date based on the year and month column
      await queryInterface.sequelize.query(
        'UPDATE "Benefits" SET "date" = make_timestamptz("year", "month", 1, 3, 0, 0);',
        {
          transaction
        }
      );
      // Now the date column is populated, it can be set to `Not Null`
      await queryInterface.changeColumn(
        'Benefits',
        'date',
        {
          type: Sequelize.DATE,
          allowNull: false
        },
        { transaction }
      );
      // Delete old date values
      await queryInterface.removeColumn('Benefits', 'year', { transaction });
      await queryInterface.removeColumn('Benefits', 'month', { transaction });

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
      await queryInterface.addColumn(
        'Benefits',
        'year',
        {
          type: Sequelize.INTEGER
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'Benefits',
        'month',
        {
          type: Sequelize.INTEGER
        },
        { transaction }
      );

      // Extract month and year from the timestamp
      await queryInterface.sequelize.query(
        'UPDATE "Benefits" SET "month" = extract(month from "date"), "year" = extract(year from "date");',
        {
          transaction
        }
      );

      // Now the year and month column are populated, they can be set to `Not Null`
      await queryInterface.changeColumn(
        'Benefits',
        'year',
        {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        { transaction }
      );
      await queryInterface.changeColumn(
        'Benefits',
        'month',
        {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        { transaction }
      );
      await queryInterface.removeColumn('Benefits', 'date', { transaction });

      await transaction.commit();
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  }
};
