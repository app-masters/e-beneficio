import express from 'express';
import logging from '../utils/logging';
import * as familyModel from '../models/families';
import * as consumptionModel from '../models/consumptions';

const router = express.Router({ mergeParams: true });

/**
 * Search of family by NIS number
 */
router.get('/', async (req, res) => {
  try {
    if (!req.user?.cityId) throw Error('User without selected city');
    const item = await familyModel.findByNis(req.query.nis, req.user.cityId);
    const balance = await consumptionModel.getFamilyBalance(item);
    res.send({ ...item, balance });
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

export default router;
