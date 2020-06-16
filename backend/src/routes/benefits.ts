import express from 'express';
import logging from '../utils/logging';
import * as benefitModel from '../models/benefits';

const router = express.Router({ mergeParams: true });

/**
 * Sub-route to GET the list of items
 */
router.get('/', async (req, res) => {
  try {
    if (!req.user?.cityId) throw Error('User without selected city');
    const items = await benefitModel.getAllWithProduct(req.user.cityId);
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
    const item = await benefitModel.getById(req.params.id, req.user.cityId);
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
    if (!req.user?.cityId) throw Error('User without selected city');
    let item;
    if (req.body.value) item = await benefitModel.create(req.body);
    else item = await benefitModel.createWithProduct(req.body);
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
    let item;
    if (req.body.value) item = await benefitModel.updateById(req.params.id, req.body, req.user.cityId);
    else item = await benefitModel.updateWithProduct(req.params.id, req.body, req.user.cityId);
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
    await benefitModel.deleteById(req.params.id, req.user.cityId);
    res.send({ success: true });
  } catch (error) {
    logging.error(error);
    res.status(500).send(error.message);
  }
});

export default router;
