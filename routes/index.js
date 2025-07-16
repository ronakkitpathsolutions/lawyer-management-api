import express from 'express';
import authRoutes from './auth.routes.js';
import clientRoutes from './client.routes.js';

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);

export default router;
