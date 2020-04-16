import express from 'express';
import logging from '../utils/logging';
import * as consumptionModel from '../models/consumptions';

const router = express.Router({ mergeParams: true });

/**
 * Dashboard info
 */
router.get('/', async (req, res) => {
  try {
    if (!req.user?.cityId) throw Error('User without selected city');
    const data = await consumptionModel.getConsumptionDashboardInfo(req.user.cityId, req.user.placeStoreId);
    return res.send(data);
  } catch (error) {
    logging.error(error);
    return res.status(500).send(error.message);
  }
});

export default router;
