import express from 'express';
import path from 'path';
import moment from 'moment';
import Sequelize from 'sequelize';
import logging from '../utils/logging';
import { sequelize } from '../schemas';
// Midlewares
import { jwtMiddleware } from '../middlewares/auth';
import { requirePublicAuth } from '../middlewares/publicAuth';

// Sub-routers
import authRoutes from './auth';
import publicRoutes from './public';
import cityRoutes from './cities';
import placeRoutes from './places';
import placeStoreRoutes from './placeStores';
import userRoutes from './users';
import institutionRoutes from './institutions';
import benefitRoutes from './benefits';
import familyRoutes from './families';
import consumptionRoutes from './consumptions';
import dashboardRoutes from './dashboard';

const router = express.Router();

// Base api URL
router.get('/', (req, res) =>
  res.send({
    version: process.env.npm_package_version,
    now: moment().format()
  })
);
router.get(
  '/health',
  // Returning data to the request
  async (req, res) => {
    const result = { database: false, databaseTime: null, serverTime: moment().format() };
    try {
      const [{ now }] = await sequelize.query('select now() as now', { type: Sequelize.QueryTypes.SELECT });
      result.databaseTime = now;
      result.database = true;
    } catch (e) {
      console.log(e.message);
      logging.error('Health check error', { e });
    }
    res.send(result);
  }
);
// Sub-routers
router.use('/auth', authRoutes);
router.use('/public', requirePublicAuth, publicRoutes);
router.use('/cities', jwtMiddleware, cityRoutes);
router.use('/places', jwtMiddleware, placeRoutes);
router.use('/place-stores', jwtMiddleware, placeStoreRoutes);
router.use('/users', jwtMiddleware, userRoutes);
router.use('/institutions', jwtMiddleware, institutionRoutes);
router.use('/benefits', jwtMiddleware, benefitRoutes);
router.use('/families', jwtMiddleware, familyRoutes);
router.use('/consumptions', jwtMiddleware, consumptionRoutes);
router.use('/dashboard', jwtMiddleware, dashboardRoutes);
router.use('/static', jwtMiddleware, express.static(`${path.dirname(__dirname)}/../database/storage`));

export default router;
