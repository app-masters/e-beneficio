import express from 'express';
import logging from '../utils/logging';
import * as consumptionModel from '../models/consumptions';

const router = express.Router({ mergeParams: true });

/**
 * Search of family by NIS number
 */
router.post('/', async (req, res) => {
  try {
    if (!req.user?.placeStoreId) throw Error('User without selected store creating consumption');
    const item = await consumptionModel.addConsumption(req.body, req.user.placeStoreId);
    res.send(item);
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

export default router;
