import { createApiResponse, asyncHandler } from '../utils/helper.js';
import Client from '../models/client.model.js';
import User from '../models/user.model.js';
import Relationship from '../models/relationship.model.js';
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
          {
            model: Relationship,
            as: 'relationships',
            attributes: [
              'id',
              'member_name',
              'member_email',
              'relationship',
              'date_of_birth',
              'contact_number',
              'nationality',
              'passport_number',
              'has_yellow_or_pink_card',
              'has_bought_property_in_thailand',
            ],
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
      {
        model: Relationship,
        as: 'relationships',
        attributes: [
          'id',
          'member_name',
          'member_email',
          'relationship',
          'date_of_birth',
          'contact_number',
          'nationality',
          'passport_number',
          'has_yellow_or_pink_card',
          'has_bought_property_in_thailand',
        ],
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
      {
        model: Relationship,
        as: 'relationships',
        attributes: [
          'id',
          'member_name',
          'member_email',
          'relationship',
          'date_of_birth',
          'contact_number',
          'nationality',
          'passport_number',
          'has_yellow_or_pink_card',
          'has_bought_property_in_thailand',
        ],
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
  const createdBy = req.user.id;

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

  // update members in Relationship table if provided
  if (
    validatedData?.relationships &&
    Array.isArray(validatedData.relationships)
  ) {
    // delete existing relationships for this client
    await Relationship.destroy({ where: { client_id: id } });

    // create new relationships
    const relationshipsData = validatedData.relationships.map(member => ({
      client_id: id || member.client_id, // use existing client_id or fallback to member's client_id if provided
      member_name: member.member_name,
      member_email: member.member_email,
      relationship: member.relationship,
      date_of_birth: member.date_of_birth,
      contact_number: member.contact_number,
      nationality: member.nationality,
      passport_number: member.passport_number,
      has_yellow_or_pink_card: member.has_yellow_or_pink_card,
      has_bought_property_in_thailand: member.has_bought_property_in_thailand,
      created_by: createdBy,
    }));

    await Relationship.bulkCreate(relationshipsData);
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
      {
        model: Relationship,
        as: 'relationships',
        attributes: [
          'id',
          'member_name',
          'relationship',
          'date_of_birth',
          'contact_number',
          'nationality',
          'passport_number',
          'has_yellow_or_pink_card',
          'has_bought_property_in_thailand',
        ],
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

// Delete member (Admin only)
export const deleteMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const member = await Relationship.findByPk(id);
  if (!member) {
    return res
      .status(404)
      .json(
        createApiResponse(
          false,
          VALIDATION_MESSAGES.RELATIONSHIP.GENERAL.NOT_FOUND
        )
      );
  }

  await member.destroy();

  return res
    .status(200)
    .json(createApiResponse(true, 'Member deleted successfully'));
}, 'Failed to delete member');

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
