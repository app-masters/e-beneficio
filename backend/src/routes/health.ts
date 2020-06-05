import express from 'express';
import moment from 'moment';
import Sequelize from 'sequelize';
import { sequelize } from '../schemas';
import logging from '../utils/logging';
import storage from '../utils/storage';

const router = express.Router({ mergeParams: true });

/**
 * Sub-route to GET the list of items
 */
router.get(
  '/',
  // Returning data to the request
  async (req, res) => {
    const result = {
      database: false,
      databaseTime: null,
      serverTime: moment().format(),
      utcTime: moment().utc().format(),
      fullStorageAccess: false
    };
    try {
      const [{ now }] = await sequelize.query('select now() as now', { type: Sequelize.QueryTypes.SELECT });
      result.databaseTime = now;
      result.database = true;
    } catch (e) {
      console.log(e.message);
      logging.error('Health check database error', { e });
    }
    try {
      result.fullStorageAccess = await storage.check();
    } catch (e) {
      console.log(e.message);
      logging.error('Health check storage error', { e });
    }
    res.send(result);
  }
);
export default router;
