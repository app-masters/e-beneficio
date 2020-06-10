import cron from 'node-cron';
import { runConsumptionScrapingCron } from './consumptionScraping';
import { runConsumptionValidationCron } from './consumptionValidation';

/**
 * Setup all of the cronjobs in the system
 */
export const setupCronjobs = () => {
  /**
   * Scrape the Receita Federal site for purchase data
   * Runs every hour, at 03:00
   */
  cron.schedule('0 3 * * *', () => runConsumptionScrapingCron());

  /**
   * Validate all pending consumptions
   * Runs every day 4 am
   */
  cron.schedule('0 4 * * *', () => runConsumptionValidationCron());
};
