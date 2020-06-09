import cron from 'node-cron';
import { runConsumptionScrapingCron } from './consumptionScraping';
import { runConsumptionValidationCron } from './consumptionValidation';

/**
 * Setup all of the cronjobs in the system
 */
export const setupCronjobs = () => {
  /**
   * Scrape the Receita Federal site for purchase data
   * Runs every hour, at 01:10, 02:10, 03:10, etc...
   */
  cron.schedule('10 * * * *', () => runConsumptionScrapingCron());

  /**
   * Validate all pensing consumptions
   * Runs every day 2 am
   */
  cron.schedule('0 2 * * *', () => runConsumptionValidationCron());
};
