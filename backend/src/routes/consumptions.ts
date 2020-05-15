import express from 'express';
import logging from '../utils/logging';
import * as consumptionModel from '../models/consumptions';
import { uploadFile } from '../utils/file';

const router = express.Router({ mergeParams: true });

/**
 * Create new consumption for the placeStore the logged user
 */
router.post('/', async (req, res) => {
  try {
    if (!req.user?.placeStoreId) throw Error('User without selected store creating consumption');

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    let image = req.files.image;
    if (Array.isArray(image)) {
      image = image[0];
    }
    const data = await uploadFile(
      `image`,
      `placeStore-${req.user?.placeStoreId}/consumption-${new Date().getTime()}`,
      image
    );
    if (!data) {
      throw { message: `Failed to upload image to the store` };
    }
    const item = await consumptionModel.addConsumption({ ...req.body, proofImageUrl: data.url }, req.user.placeStoreId);
    return res.send(item);
  } catch (error) {
    logging.error(error);
    return res.status(error.status || 500).send(error.message);
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
    const data = await uploadFile(
      `image`,
      `placeStore-${req.user?.placeStoreId}/consumption-${new Date().getTime()}`,
      image
    );
    return res.send(data);
  } catch (error) {
    logging.error(error);
    return res.status(error.status || 500).send(error.message);
  }
});

router.get('/report', async (req, res) => {
  try {
    if (!req.user?.cityId) throw Error('User without selected store creating consumption');
    let data;
    if (req.user.placeStoreId) {
      data = await consumptionModel.getPlaceConsumptionsReport(
        req.query.minDate as string,
        req.query.maxDate as string,
        undefined,
        req.user.placeStoreId as string
      );
    } else {
      data = await consumptionModel.getPlaceConsumptionsReport(
        req.query.minDate as string,
        req.query.maxDate as string,
        req.query.placeId as string,
        req.query.placeStoreId as string
      );
    }

    return res.send(data);
  } catch (error) {
    logging.error(error);
    return res.status(error.status || 500).send(error.message);
  }
});

export default router;
