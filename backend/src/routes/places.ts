import express from 'express';
import logging from '../utils/logging';
import * as placeModel from '../models/places';

const router = express.Router({ mergeParams: true });

/**
 * Sub-route to GET the list of items
 */
router.get('/', async (req, res) => {
  try {
    if (!req.user?.cityId) throw Error('User without selected city');
    const items = await placeModel.getAll(req.user.cityId);
    res.send(items);
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

/**
 * Sub-route to GET the detail of item
 */
router.get('/:id', async (req, res) => {
  try {
    if (!req.user?.cityId) throw Error('User without selected city');
    const item = await placeModel.getById(req.params.id, req.user.cityId);
    if (!item || item.cityId !== req.user.cityId) {
      res.status(404).send('Not found');
    }
    res.send(item);
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

/**
 * Sub-route to POST a new item
 */
router.post('/', async (req, res) => {
  try {
    if (!req.user?.cityId) throw Error('User without selected city');
    const item = await placeModel.create(req.body, req.user.cityId);
    res.send(item);
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

/**
 * Sub-route to PUT an existing item
 */
router.put('/:id', async (req, res) => {
  try {
    if (!req.user?.cityId) throw Error('User without selected city');
    // Call the model
    const item = await placeModel.updateById(req.params.id, req.body, req.user.cityId);
    res.send(item);
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

/**
 * Sub-route to DELETE an existing item
 */
router.delete('/:id', async (req, res) => {
  try {
    if (!req.user?.cityId) throw Error('User without selected city');
    // Call the model
    await placeModel.deleteById(req.params.id, req.user.cityId);
    res.send({ success: true });
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

export default router;
