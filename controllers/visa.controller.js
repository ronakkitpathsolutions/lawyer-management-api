import { createApiResponse, asyncHandler } from '../utils/helper.js';
import Visa from '../models/visa.model.js';
import Client from '../models/client.model.js';
import User from '../models/user.model.js';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import { Op, fn, col, literal } from 'sequelize';

// Create a new visa record (Admin only)
export const createVisa = asyncHandler(async (req, res) => {
  const { validatedData } = req;
  const createdBy = req.user.id;

  // Create visa record
  const visaData = {
    ...validatedData,
    created_by: createdBy,
  };

  const visa = await Visa.create(visaData);

  // Fetch the created visa with associations
  const createdVisa = await Visa.findByPk(visa.id, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'family_name', 'email', 'nationality'],
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return res.status(201).json(
    createApiResponse(true, 'Visa record created successfully', {
      visa: createdVisa,
    })
  );
}, 'Failed to create visa record');

// Get all visa records with pagination and search (Admin only)
export const getAllVisas = asyncHandler(async (req, res) => {
  const { validatedData } = req;
  const result = await Visa.paginateWithSearch({
    ...validatedData,
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'family_name', 'email', 'nationality'],
      },
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
      createApiResponse(true, 'Visa records retrieved successfully', result)
    );
}, 'Failed to retrieve visa records');

// Get visa record by ID (Admin only)
export const getVisaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const visa = await Visa.findByPk(id, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: [
          'id',
          'name',
          'family_name',
          'email',
          'nationality',
          'passport_number',
        ],
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  if (!visa) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.VISA.GENERAL.NOT_FOUND)
      );
  }

  return res
    .status(200)
    .json(
      createApiResponse(true, 'Visa record retrieved successfully', { visa })
    );
}, 'Failed to retrieve visa record');

// Get visa records by client ID with pagination and search (Admin only)
export const getVisasByClientId = asyncHandler(async (req, res) => {
  const { client_id } = req.params;
  const {
    page,
    limit,
    search,
    existing_visa,
    wished_visa,
    is_active,
    sortBy,
    sortOrder,
  } = req.validatedQuery || req.query;

  // Use default values if validatedQuery is not available
  const queryParams = {
    page: page || 1,
    limit: limit || 10,
    search: search || '',
    existing_visa,
    wished_visa,
    is_active,
    sortBy: sortBy,
    sortOrder: sortOrder,
  };

  // Check if client exists
  const client = await Client.findByPk(client_id);
  if (!client) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.VISA.CLIENT_ID.NOT_FOUND)
      );
  }

  // Use the pagination method with client_id filter
  const result = await Visa.paginateWithSearch({
    page: parseInt(queryParams.page),
    limit: parseInt(queryParams.limit),
    search: queryParams.search,
    client_id: parseInt(client_id),
    existing_visa: queryParams.existing_visa,
    wished_visa: queryParams.wished_visa,
    is_active: queryParams.is_active,
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder,
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'family_name', 'email', 'nationality'],
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return res.status(200).json(
    createApiResponse(true, 'Client visa records retrieved successfully', {
      ...result,
    })
  );
}, 'Failed to retrieve client visa records');

// Update visa record (Admin only)
export const updateVisa = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { validatedData } = req;

  // Find visa record
  const visa = await Visa.findByPk(id);
  if (!visa) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.VISA.GENERAL.NOT_FOUND)
      );
  }

  // Update visa record
  await visa.update(validatedData);

  // Fetch updated visa with associations
  const updatedVisa = await Visa.findByPk(id, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'family_name', 'email', 'nationality'],
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return res.status(200).json(
    createApiResponse(true, 'Visa record updated successfully', {
      visa: updatedVisa,
    })
  );
}, 'Failed to update visa record');

// Delete visa record (Admin only)
export const deleteVisa = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const visa = await Visa.findByPk(id);
  if (!visa) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.VISA.GENERAL.NOT_FOUND)
      );
  }

  await visa.destroy();

  return res
    .status(200)
    .json(createApiResponse(true, 'Visa record deleted successfully'));
}, 'Failed to delete visa record');

// Toggle visa record active status (Admin only)
export const toggleVisaStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const visa = await Visa.findByPk(id);
  if (!visa) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.VISA.GENERAL.NOT_FOUND)
      );
  }

  await visa.update({ is_active: !visa.is_active });

  // Fetch updated visa with associations
  const updatedVisa = await Visa.findByPk(id, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'family_name', 'email', 'nationality'],
      },
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
        `Visa record ${updatedVisa.is_active ? 'activated' : 'deactivated'} successfully`,
        { visa: updatedVisa }
      )
    );
}, 'Failed to toggle visa record status');

// Get visa statistics (Admin only)
export const getVisaStats = asyncHandler(async (req, res) => {
  const totalVisas = await Visa.count();
  const activeVisas = await Visa.count({ where: { is_active: true } });
  const inactiveVisas = await Visa.count({ where: { is_active: false } });

  // Get visas by existing visa type
  const visasByExistingType = await Visa.findAll({
    attributes: ['existing_visa', [fn('COUNT', col('id')), 'count']],
    group: ['existing_visa'],
    order: [[literal('count'), 'DESC']],
    limit: 10,
  });

  // Get visas by wished visa type
  const visasByWishedType = await Visa.findAll({
    attributes: ['wished_visa', [fn('COUNT', col('id')), 'count']],
    group: ['wished_visa'],
    order: [[literal('count'), 'DESC']],
    limit: 10,
  });

  // Get recent visa records (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentVisas = await Visa.count({
    where: {
      createdAt: {
        [Op.gte]: thirtyDaysAgo,
      },
    },
  });

  // Get expiring visas (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringVisas = await Visa.count({
    where: {
      existing_visa_expiry: {
        [Op.between]: [new Date(), thirtyDaysFromNow],
      },
      is_active: true,
    },
  });

  const stats = {
    totalVisas,
    activeVisas,
    inactiveVisas,
    recentVisas,
    expiringVisas,
    visasByExistingType: visasByExistingType.map(item => ({
      type: item.existing_visa,
      count: parseInt(item.dataValues.count),
    })),
    visasByWishedType: visasByWishedType.map(item => ({
      type: item.wished_visa,
      count: parseInt(item.dataValues.count),
    })),
  };

  return res.status(200).json(
    createApiResponse(true, 'Visa statistics retrieved successfully', {
      stats,
    })
  );
}, 'Failed to retrieve visa statistics');
