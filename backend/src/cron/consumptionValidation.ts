import logging from '../utils/logging';
import db from '../schemas';
import { validateConsumption } from '../models/consumptions';

let cronjobRunning = false;

/**
 * Run the consumption validation for each consumption that has a
 * null `reviewedAt` field
 */
export const runConsumptionValidationCron = async () => {
  if (cronjobRunning) {
    logging.critical('[cron] Consumptions Validation: Cron job already running');
    return;
  }

  cronjobRunning = true;
  logging.info('[cron] Consumptions Validation: Cron job starting');

  try {
    // Get all consumptions without a review date
    const consumptions = await db.consumptions.findAll({
      where: {
        reviewedAt: null
      },
      order: [['id', 'ASC']]
    });

    // Avoid muiltiple promisses to affect the server response time, serialize the validation
    await consumptions
      .map((consumption) => async () => await validateConsumption(consumption, true))
      .reduce(
        (promise, fn) => promise.then((result) => fn().then(Array.prototype.concat.bind(result))),
        Promise.resolve([] as void[])
      );
  } catch (error) {
    logging.critical('[cron] Consumptions Validation: Cron failed to run', error);
  } finally {
    cronjobRunning = false;
  }
};
