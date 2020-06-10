import express from 'express';
import logging from '../utils/logging';
import * as familyModel from '../models/families';
import * as consumptionModel from '../models/consumptions';
import * as placeStoreModel from '../models/placeStores';
import { uploadFile } from '../utils/file';

const router = express.Router({ mergeParams: true });

/**
 * Search of family by NIS number
 */
router.get('/families', async (req, res) => {
  try {
    const item = await familyModel.findByNis(req.query.nis as string, req.query.cityId as string, undefined, true);
    if (!item) return res.status(404).send('Not found');
    const balance = await consumptionModel.getFamilyDependentBalance(item);
    return res.send({
      id: item.id,
      balance,
      school: item.school,
      responsibleName: item.responsibleName,
      responsibleBirthday: item.responsibleBirthday
    });
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
    const list = await placeStoreModel.getAll(req.query.cityId as string);
    res.send(list);
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

/**
 * Search of family by NIS number
 */
router.post('/consumptions', async (req, res) => {
  try {
    let proofImageUrl: string | null = null;
    // Check if there is a image in the request
    if (req.files && Object.keys(req.files).length !== 0) {
      let image = req.files.image;
      if (Array.isArray(image)) {
        image = image[0];
      }
      const data = await uploadFile(`image`, `public/consumption-${new Date().getTime()}`, image);
      if (!data) {
        throw { message: `Failed to upload image to the store` };
      } else {
        proofImageUrl = data.url;
      }
    }
    const item = await consumptionModel.addConsumption({ ...req.body, proofImageUrl });

    // Scrape the purchase data, but don't wait for it
    consumptionModel.scrapeConsumption(item);

    return res.send(item);
  } catch (error) {
    logging.error(error);
    return res.status(error.status || 500).send(error.message);
  }
});

export default router;
