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
    res.send({ ...item.toJSON(), balance });
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

/**
 * Family dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    if (!req.user?.cityId) throw Error('User without selected city');
    const data = await familyModel.getDashboardInfo(req.user.cityId);
    res.send(data);
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

/**
 * Upload CSV file with family list
 */
router.post('/file', async (req, res) => {
  try {
    if (!req.user?.cityId) throw Error('User without selected city');
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    let file = req.files.file;
    if (Array.isArray(file)) {
      file = file[0];
    }
    const data = await familyModel.importFamilyFromCSVFile(file.tempFilePath, req.user.cityId);
    return res.send(data);
  } catch (error) {
    logging.error(error);
    return res.status(error.status || 500).send(error.message);
  }
});

export default router;
