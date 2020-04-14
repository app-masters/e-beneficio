import express from 'express';
import moment from 'moment';
// Middleware
import { jwtMiddleware } from '../middlewares/auth';

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

const router = express.Router();

// Base api URL
router.get('/', (req, res) =>
  res.send({
    version: process.env.npm_package_version,
    now: moment().format()
  })
);
router.get('/ping', (req, res) => res.send('pong pong'));
// Sub-routers
router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/cities', jwtMiddleware, cityRoutes);
router.use('/places', jwtMiddleware, placeRoutes);
router.use('/place-stores', jwtMiddleware, placeStoreRoutes);
router.use('/users', jwtMiddleware, userRoutes);
router.use('/institutions', jwtMiddleware, institutionRoutes);
router.use('/benefits', jwtMiddleware, benefitRoutes);
router.use('/families', jwtMiddleware, familyRoutes);
router.use('/consumptions', jwtMiddleware, consumptionRoutes);

export default router;
