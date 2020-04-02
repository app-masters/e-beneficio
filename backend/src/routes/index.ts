import express from 'express';
import moment from 'moment';
// Midlewares
import { jwtMiddleware } from '../middlewares/auth';

// Sub-routers
import authRoutes from './auth';
import cityRoutes from './cities';
import placeRoutes from './places';
import placeStoreRoutes from './placeStores';
import userRoutes from './users';

const router = express.Router();

// Base api URL
router.get('/', (req, res) =>
  res.send({
    version: process.env.npm_package_version,
    now: moment().format()
  })
);
// Sub-routers
router.use('/auth', authRoutes);
router.use('/cities', jwtMiddleware, cityRoutes);
router.use('/places', jwtMiddleware, placeRoutes);
router.use('/place-stores', jwtMiddleware, placeStoreRoutes);
router.use('/users', jwtMiddleware, userRoutes);

export default router;
