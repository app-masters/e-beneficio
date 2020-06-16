import express from 'express';
import logging from '../utils/logging';
import * as productModel from '../models/products';

const router = express.Router({ mergeParams: true });

/**
 * Sub-route to GET the list of products
 */
router.get('/', async (req, res) => {
  try {
    const items = await productModel.getAll();
    res.send(items);
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

/**
 * Sub-route to GET the list of products with `isValid === null`
 */
router.get('/validate', async (req, res) => {
  try {
    const items = await productModel.getAllUnset();
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
    const item = await productModel.getById(req.params.id);
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
    const item = await productModel.create(req.body);
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
    const { isValid } = req.body;
    // Only accepts null, true or false as value
    if (typeof isValid !== 'boolean') return res.status(400).send('Invalid isValid value');
    const item = await productModel.updateById(req.params.id, { isValid });
    return res.send(item);
  } catch (error) {
    logging.error(error);
    return res.status(500).send(error.message);
  }
});

/**
 * Sub-route to DELETE an existing item
 */
router.delete('/:id', async (req, res) => {
  try {
    // Call the model
    await productModel.deleteById(req.params.id);
    res.send({ success: true });
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

export default router;
