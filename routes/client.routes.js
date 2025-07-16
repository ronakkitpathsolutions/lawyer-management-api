import express from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  toggleClientStatus,
  getClientStats,
} from '../controllers/client.controller.js';
import {
  validateCreateClient,
  validateUpdateClient,
  validateClientSearch,
  validateClientId,
  requireAdminRole,
} from '../middlewares/client.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(requireAdminRole);

// Routes for client management
// GET /api/clients/stats - Get client statistics
router.get('/stats', getClientStats);

// GET /api/clients - Get all clients with pagination and search
router.get('/', validateClientSearch, getAllClients);

// POST /api/clients - Create a new client
router.post('/create', validateCreateClient, createClient);

// GET /api/clients/:id - Get client by ID
router.get('/:id', validateClientId, getClientById);

// PUT /api/clients/:id - Update client
router.patch('/:id', validateClientId, validateUpdateClient, updateClient);

// DELETE /api/clients/:id - Delete client
router.delete('/:id', validateClientId, deleteClient);

// PATCH /api/clients/:id/toggle-status - Toggle client active status
router.patch('/:id/toggle-status', validateClientId, toggleClientStatus);

export default router;
