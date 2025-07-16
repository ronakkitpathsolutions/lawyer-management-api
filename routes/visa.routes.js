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
  requireAdminRole,
} from '../middlewares/visa.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(requireAdminRole);

// Routes for visa management
// GET /api/visas/stats - Get visa statistics
router.get('/stats', getVisaStats);

// GET /api/visas - Get all visa records with pagination and search
router.get('/', validateVisaSearch, getAllVisas);

// POST /api/visas - Create a new visa record
router.post('/create', validateCreateVisa, createVisa);

// GET /api/visas/client/:client_id - Get visa records by client ID
router.get('/client/:client_id', getVisasByClientId);

// GET /api/visas/:id - Get visa record by ID
router.get('/:id', validateVisaId, getVisaById);

// PUT /api/visas/:id - Update visa record
router.patch('/:id', validateVisaId, validateUpdateVisa, updateVisa);

// DELETE /api/visas/:id - Delete visa record
router.delete('/:id', validateVisaId, deleteVisa);

// PATCH /api/visas/:id/toggle-status - Toggle visa record active status
router.patch('/:id/toggle-status', validateVisaId, toggleVisaStatus);

export default router;
