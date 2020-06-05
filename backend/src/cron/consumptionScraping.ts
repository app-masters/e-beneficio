import logging from '../utils/logging';
import db from '../schemas';
import { Op } from 'sequelize';
import { scrapeConsumption } from '../models/consumptions';

let cronjobRunning = false;

/**
 * Selects the last 100 consumptions that have a nfce link and has not been
 * processed yet and scrape the site for the purchase data.
 */
export const runConsumptionScrapingCron = async () => {
  if (cronjobRunning) {
    logging.critical('[cron] Consumptions Scraping: Cron job already running');
    return;
  }

  cronjobRunning = true;
  logging.info('[cron] Consumptions Scraping: Cron job starting');

  try {
    // Get the 100 oldest consumptions with `nfce` and without `purchaseData`
    const consumptions = await db.consumptions.findAll({
      where: {
        [Op.and]: [{ [Op.not]: { nfce: null } }, { purchaseData: null }]
      },
      limit: 100,
      order: [['id', 'ASC']]
    });

    // Avoid a hundred chrome instances running at the same time, serialize the scraping
    await consumptions
      .map((consumption) => async () => await scrapeConsumption(consumption, true))
      .reduce(
        (promise, fn) => promise.then((result) => fn().then(Array.prototype.concat.bind(result))),
        Promise.resolve([] as void[])
      );
  } catch (error) {
    logging.critical('[cron] Consumptions Scraping: Cron failed to run', error);
  } finally {
    cronjobRunning = false;
  }
};
