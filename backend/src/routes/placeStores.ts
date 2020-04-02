import express from 'express';
import logging from '../utils/logging';
import * as placeStoreModel from '../models/placeStores';

const router = express.Router({ mergeParams: true });

/**
 * Sub-route to GET the list of items
 */
router.get('/', async (req, res) => {
  try {
    const items = await placeStoreModel.getAll();
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
    const item = await placeStoreModel.getById(req.params.id);
    if (!item) {
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
    const item = await placeStoreModel.create(req.body);
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
    const item = await placeStoreModel.updateById(req.params.id, req.body);
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
    await placeStoreModel.deleteById(req.params.id);
    res.send({ success: true });
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

export default router;
