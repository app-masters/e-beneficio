import express from 'express';
import path from 'path';
// Midlewares
import { jwtMiddleware } from '../middlewares/auth';
import { requirePublicAuth } from '../middlewares/publicAuth';

// Sub-routers
import authRoutes from './auth';
import healthRoutes from './health';
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
import productsRoutes from './products';

const router = express.Router();

// Base api URL
router.get('/', (req, res) => res.send({ version: process.env.npm_package_version, alive: true }));

// Sub-routers
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/public', requirePublicAuth, publicRoutes);
router.use('/cities', jwtMiddleware, cityRoutes);
router.use('/places', jwtMiddleware, placeRoutes);
router.use('/place-stores', jwtMiddleware, placeStoreRoutes);
router.use('/users', jwtMiddleware, userRoutes);
router.use('/institutions', jwtMiddleware, institutionRoutes);
router.use('/benefits', jwtMiddleware, benefitRoutes);
router.use('/families', jwtMiddleware, familyRoutes);
router.use('/consumptions', consumptionRoutes);
router.use('/dashboard', jwtMiddleware, dashboardRoutes);
router.use('/products', jwtMiddleware, productsRoutes);
router.use('/static', jwtMiddleware, express.static(`${path.dirname(__dirname)}/../database/storage`));

export default router;
