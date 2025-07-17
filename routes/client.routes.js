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

const clientRoutes = express.Router();

// Apply authentication and admin role check to all routes
clientRoutes.use(authenticateToken);
clientRoutes.use(requireAdminRole);

// Routes for client management
// GET /api/clients/stats - Get client statistics
clientRoutes.get('/stats', getClientStats);

// GET /api/clients - Get all clients with pagination and search
clientRoutes.get('/', validateClientSearch, getAllClients);

// POST /api/clients - Create a new client
clientRoutes.post('/create', validateCreateClient, createClient);

// GET /api/clients/:id - Get client by ID
clientRoutes.get('/:id', validateClientId, getClientById);

// PUT /api/clients/:id - Update client
clientRoutes.patch(
  '/:id',
  validateClientId,
  validateUpdateClient,
  updateClient
);

// DELETE /api/clients/:id - Delete client
clientRoutes.delete('/:id', validateClientId, deleteClient);

// PATCH /api/clients/:id/toggle-status - Toggle client active status
clientRoutes.patch('/:id/toggle-status', validateClientId, toggleClientStatus);

export default clientRoutes;
