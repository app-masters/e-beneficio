import cron from 'node-cron';
import { runConsumptionScrapingCron } from './consumptionScraping';

/**
 * Setup all of the cronjobs in the system
 */
export const setupCronjobs = () => {
  /**
   * Scrape the Receita Federal site for purchase data
   * Runs every hour, at 01:10, 02:10, 03:10, etc...
   */
  cron.schedule('10 * * * *', () => runConsumptionScrapingCron());
};
