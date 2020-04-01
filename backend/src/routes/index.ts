import express from 'express';
import moment from 'moment';

import cityRoutes from './cities';

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

export default router;
