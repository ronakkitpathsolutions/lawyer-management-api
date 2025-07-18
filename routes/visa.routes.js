import express from 'express';
import {
  createVisa,
  getAllVisas,
  getVisaById,
  getVisasByClientId,
  updateVisa,
  deleteVisa,
  toggleVisaStatus,
  getVisaStats,
} from '../controllers/visa.controller.js';
import {
  validateCreateVisa,
  validateUpdateVisa,
  validateVisaSearch,
  validateVisaId,
  validateClientVisaSearch,
  requireAdminRole,
} from '../middlewares/visa.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const authRoutes = express.Router();

// Apply authentication and admin role check to all routes
authRoutes.use(authenticateToken);
authRoutes.use(requireAdminRole);

// Routes for visa management
// GET /api/visas/stats - Get visa statistics
authRoutes.get('/stats', getVisaStats);

// GET /api/visas - Get all visa records with pagination and search
authRoutes.get('/', validateVisaSearch, getAllVisas);

// POST /api/visas - Create a new visa record
authRoutes.post('/create', validateCreateVisa, createVisa);

// GET /api/visas/client/:client_id - Get visa records by client ID with pagination and search
authRoutes.get(
  '/client/:client_id',
  validateClientVisaSearch,
  getVisasByClientId
);

// GET /api/visas/:id - Get visa record by ID
authRoutes.get('/:id', validateVisaId, getVisaById);

// PUT /api/visas/:id - Update visa record
authRoutes.patch('/:id', validateVisaId, validateUpdateVisa, updateVisa);

// DELETE /api/visas/:id - Delete visa record
authRoutes.delete('/:id', validateVisaId, deleteVisa);

// PATCH /api/visas/:id/toggle-status - Toggle visa record active status
authRoutes.patch('/:id/toggle-status', validateVisaId, toggleVisaStatus);

export default authRoutes;
