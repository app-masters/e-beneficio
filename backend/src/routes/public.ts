import express from 'express';
import logging from '../utils/logging';
import * as familyModel from '../models/families';
import * as consumptionModel from '../models/consumptions';
import * as placeStoreModel from '../models/placeStores';

const router = express.Router({ mergeParams: true });

/**
 * Search of family by NIS number
 */
router.get('/families', async (req, res) => {
  try {
    const item = await familyModel.findByNis(req.query.nis, req.query.cityId);
    if (!item) return res.status(404).send('Not found');
    const balance = await consumptionModel.getFamilyBalance(item);
    return res.send({ ...item.toJSON(), balance });
  } catch (error) {
    logging.error(error);
    return res.status(500).send(error.message);
  }
});

/**
 * Get list of place stores
 */
router.get('/place-stores', async (req, res) => {
  try {
    console.log('place-stores-here!!!!!!!!');
    const list = await placeStoreModel.getAll(req.query.cityId);
    console.log('lentght', list.length);
    res.send(list);
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

export default router;
