'use strict';

module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        'ALTER TABLE "BenefitProducts" DROP CONSTRAINT "BenefitProducts_benefitsId_fkey"',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE "BenefitProducts" ADD CONSTRAINT "BenefitProducts_benefitsId_fkey" FOREIGN KEY ("benefitsId") REFERENCES "Benefits" ("id") ON DELETE CASCADE;',
        { transaction }
      );
      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        'ALTER TABLE "BenefitProducts" DROP CONSTRAINT "BenefitProducts_benefitsId_fkey"',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'ALTER TABLE "BenefitProducts" ADD CONSTRAINT "BenefitProducts_benefitsId_fkey" FOREIGN KEY ("benefitsId") REFERENCES "Benefits" ("id");',
        { transaction }
      );
      return transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
