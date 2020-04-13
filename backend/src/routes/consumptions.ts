import express from 'express';
import logging from '../utils/logging';
import * as consumptionModel from '../models/consumptions';
import { uploadFile } from '../utils/file';

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
    res.status(error.status || 500).send(error.message);
  }
});

/**
 * Upload image
 */
router.post('/image', async (req, res) => {
  try {
    if (!req.user?.placeStoreId) throw Error('User without selected store creating consumption');
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    let image = req.files.image;
    if (Array.isArray(image)) {
      image = image[0];
    }
    const data = uploadFile('image', `consumption${req.user?.placeStoreId}_${new Date().getTime()}`, image);
    return res.send(data);
  } catch (error) {
    logging.error(error);
    return res.status(error.status || 500).send(error.message);
  }
});

export default router;
