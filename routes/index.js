import express from 'express';
import authRoutes from './auth.routes.js';
import clientRoutes from './client.routes.js';
import visaRoutes from './visa.routes.js';

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/visas', visaRoutes);

export default router;
