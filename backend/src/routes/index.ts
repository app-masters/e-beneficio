import express from 'express';
import moment from 'moment';

import cityRoutes from './cities';
import placeRoutes from './places';
import placeStoreRoutes from './placeStores';

const router = express.Router();

// Base api URL
router.get('/', (req, res) =>
  res.send({
    version: process.env.npm_package_version,
    now: moment().format()
  })
);
// Sub-routers
router.use('/cities', cityRoutes);
router.use('/places', placeRoutes);
router.use('/place-stores', placeStoreRoutes);

export default router;
