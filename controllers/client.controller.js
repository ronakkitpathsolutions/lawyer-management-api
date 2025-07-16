import { createApiResponse, asyncHandler } from '../utils/helper.js';
import Client from '../models/client.model.js';
import User from '../models/user.model.js';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import { Op, fn, col, literal } from 'sequelize';

// Create a new client (Admin only)
export const createClient = asyncHandler(async (req, res) => {
  const { validatedData } = req;
  const createdBy = req.user.id;

  // Check if client with email already exists
  const existingClientByEmail = await Client.findByEmail(validatedData.email);
  if (existingClientByEmail) {
    return res
      .status(409)
      .json(
        createApiResponse(
          false,
          VALIDATION_MESSAGES.CLIENT.EMAIL.ALREADY_EXISTS
        )
      );
  }

  // Check if client with passport number already exists (only if provided)
  if (validatedData.passport_number) {
    const existingClientByPassport = await Client.findByPassportNumber(
      validatedData.passport_number
    );
    if (existingClientByPassport) {
      return res
        .status(409)
        .json(
          createApiResponse(
            false,
            VALIDATION_MESSAGES.CLIENT.PASSPORT_NUMBER.ALREADY_EXISTS
          )
        );
    }
  }

  // Create client
  const clientData = {
    ...validatedData,
    created_by: createdBy,
  };

  const client = await Client.create(clientData);

  return res.status(201).json(
    createApiResponse(true, 'Client created successfully', {
      client: await Client.findByPk(client.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email'],
          },
        ],
      }),
    })
  );
}, 'Failed to create client');

// Get all clients with pagination and search (Admin only)
export const getAllClients = asyncHandler(async (req, res) => {
  const { validatedData } = req;

  const result = await Client.paginateWithSearch({
    ...validatedData,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return res
    .status(200)
    .json(createApiResponse(true, 'Clients retrieved successfully', result));
}, 'Failed to retrieve clients');

// Get client by ID (Admin only)
export const getClientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const client = await Client.findByPk(id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  if (!client) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.CLIENT.GENERAL.NOT_FOUND)
      );
  }

  return res
    .status(200)
    .json(createApiResponse(true, 'Client retrieved successfully', { client }));
}, 'Failed to retrieve client');

// Update client (Admin only)
export const updateClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { validatedData } = req;

  // Find client
  const client = await Client.findByPk(id);
  if (!client) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.CLIENT.GENERAL.NOT_FOUND)
      );
  }

  // Check if email is being updated and if it already exists
  if (validatedData.email && validatedData.email !== client.email) {
    const existingClientByEmail = await Client.findByEmail(validatedData.email);
    if (existingClientByEmail) {
      return res
        .status(409)
        .json(
          createApiResponse(
            false,
            VALIDATION_MESSAGES.CLIENT.EMAIL.ALREADY_EXISTS
          )
        );
    }
  }

  // Check if passport number is being updated and if it already exists
  if (
    validatedData.passport_number &&
    validatedData.passport_number !== client.passport_number
  ) {
    const existingClientByPassport = await Client.findByPassportNumber(
      validatedData.passport_number
    );
    if (existingClientByPassport) {
      return res
        .status(409)
        .json(
          createApiResponse(
            false,
            VALIDATION_MESSAGES.CLIENT.PASSPORT_NUMBER.ALREADY_EXISTS
          )
        );
    }
  }

  // Update client
  await client.update(validatedData);

  // Fetch updated client with associations
  const updatedClient = await Client.findByPk(id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return res.status(200).json(
    createApiResponse(true, 'Client updated successfully', {
      client: updatedClient,
    })
  );
}, 'Failed to update client');

// Delete client (Admin only)
export const deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const client = await Client.findByPk(id);
  if (!client) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.CLIENT.GENERAL.NOT_FOUND)
      );
  }

  await client.destroy();

  return res
    .status(200)
    .json(createApiResponse(true, 'Client deleted successfully'));
}, 'Failed to delete client');

// Toggle client active status (Admin only)
export const toggleClientStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const client = await Client.findByPk(id);
  if (!client) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.CLIENT.GENERAL.NOT_FOUND)
      );
  }

  await client.update({ is_active: !client.is_active });

  // Fetch updated client with associations
  const updatedClient = await Client.findByPk(id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return res
    .status(200)
    .json(
      createApiResponse(
        true,
        `Client ${updatedClient.is_active ? 'activated' : 'deactivated'} successfully`,
        { client: updatedClient }
      )
    );
}, 'Failed to toggle client status');

// Get client statistics (Admin only)
export const getClientStats = asyncHandler(async (req, res) => {
  const totalClients = await Client.count();
  const activeClients = await Client.count({ where: { is_active: true } });
  const inactiveClients = await Client.count({ where: { is_active: false } });

  // Get clients by nationality
  const clientsByNationality = await Client.findAll({
    attributes: ['nationality', [fn('COUNT', col('id')), 'count']],
    group: ['nationality'],
    order: [[literal('count'), 'DESC']],
    limit: 10,
  });

  // Get recent clients (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentClients = await Client.count({
    where: {
      createdAt: {
        [Op.gte]: thirtyDaysAgo,
      },
    },
  });

  const stats = {
    totalClients,
    activeClients,
    inactiveClients,
    recentClients,
    clientsByNationality: clientsByNationality.map(item => ({
      nationality: item.nationality,
      count: parseInt(item.dataValues.count),
    })),
  };

  return res.status(200).json(
    createApiResponse(true, 'Client statistics retrieved successfully', {
      stats,
    })
  );
}, 'Failed to retrieve client statistics');
