import {
  createApiResponse,
  asyncHandler,
  deleteDocumentFiles,
  PROPERTY_DOCUMENT_FIELDS,
} from '../utils/helper.js';
import Property from '../models/property.model.js';
import Client from '../models/client.model.js';
import User from '../models/user.model.js';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import { Op, fn, col, literal } from 'sequelize';

// Create a new property record (Admin only)
export const createProperty = asyncHandler(async (req, res) => {
  const { validatedData } = req;
  const createdBy = req.user.id;

  // Handle document uploads if present
  const propertyData = {
    ...validatedData,
    created_by: createdBy,
  };

  // Add document paths if files were uploaded
  if (req.propertyDocuments) {
    Object.keys(req.propertyDocuments).forEach(documentType => {
      propertyData[documentType] = req.propertyDocuments[
        documentType
      ].path.replace(/\\/g, '/');
    });
  }

  const property = await Property.create(propertyData);

  // Fetch the created property with associations
  const createdProperty = await Property.findByPk(property.id, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'family_name', 'email', 'nationality'],
      },
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return res
    .status(201)
    .json(
      createApiResponse(true, 'Property created successfully', createdProperty)
    );
}, 'Failed to create property record');

// Get all property records with pagination and search (Admin only)
export const getAllProperties = asyncHandler(async (req, res) => {
  const { validatedData } = req;

  const result = await Property.paginateWithSearch({
    ...validatedData,
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'family_name', 'email', 'nationality'],
      },
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return res
    .status(200)
    .json(createApiResponse(true, 'Properties fetched successfully', result));
}, 'Failed to retrieve property records');

// Get property record by ID (Admin only)
export const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const property = await Property.findByPk(id, {
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
        as: 'createdBy',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  if (!property) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.PROPERTY.GENERAL.NOT_FOUND)
      );
  }

  return res
    .status(200)
    .json(
      createApiResponse(
        true,
        'Property record retrieved successfully',
        properties
      )
    );
}, 'Failed to retrieve property record');

// Get property records by client ID (Admin only)
export const getPropertiesByClientId = asyncHandler(async (req, res) => {
  const { client_id } = req.params;

  // Check if client exists
  const client = await Client.findByPk(client_id);
  if (!client) {
    return res
      .status(404)
      .json(
        createApiResponse(
          false,
          VALIDATION_MESSAGES.PROPERTY.CLIENT_ID.NOT_FOUND
        )
      );
  }

  const properties = await Property.findByClientId(client_id, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'family_name', 'email', 'nationality'],
      },
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return res
    .status(200)
    .json(
      createApiResponse(
        true,
        'Client property records retrieved successfully',
        properties
      )
    );
}, 'Failed to retrieve client property records');

// Update property record (Admin only)
export const updateProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { validatedData } = req;

  // Find property record
  const property = await Property.findByPk(id);
  if (!property) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.PROPERTY.GENERAL.NOT_FOUND)
      );
  }

  // Handle document uploads if present
  const updateData = { ...validatedData };

  // Add document paths if files were uploaded and delete old documents
  if (req.propertyDocuments) {
    const fieldsToUpdate = Object.keys(req.propertyDocuments);

    // Delete old documents for the fields being updated
    deleteDocumentFiles(property, fieldsToUpdate);

    // Set new document paths
    fieldsToUpdate.forEach(documentType => {
      updateData[documentType] = req.propertyDocuments[
        documentType
      ].path.replace(/\\/g, '/');
    });
  }

  // Update property record
  await property.update(updateData);

  // Fetch updated property with associations
  const updatedProperty = await Property.findByPk(id, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'family_name', 'email', 'nationality'],
      },
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return res.status(200).json(
    createApiResponse(true, 'Property record updated successfully', {
      property: updatedProperty,
    })
  );
}, 'Failed to update property record');

// Delete property record (Admin only)
export const deleteProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const property = await Property.findByPk(id);
  if (!property) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.PROPERTY.GENERAL.NOT_FOUND)
      );
  }

  // Collect all document paths for deletion
  deleteDocumentFiles(property, PROPERTY_DOCUMENT_FIELDS);

  // Delete the property record
  await property.destroy();

  return res
    .status(200)
    .json(createApiResponse(true, 'Property record deleted successfully'));
}, 'Failed to delete property record');

// Toggle property record active status (Admin only)
export const togglePropertyStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const property = await Property.findByPk(id);
  if (!property) {
    return res
      .status(404)
      .json(
        createApiResponse(false, VALIDATION_MESSAGES.PROPERTY.GENERAL.NOT_FOUND)
      );
  }

  await property.update({ is_active: !property.is_active });

  // Fetch updated property with associations
  const updatedProperty = await Property.findByPk(id, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'family_name', 'email', 'nationality'],
      },
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  return res
    .status(200)
    .json(
      createApiResponse(
        true,
        `Property record ${updatedProperty.is_active ? 'activated' : 'deactivated'} successfully`,
        updatedProperty
      )
    );
}, 'Failed to toggle property record status');

// Get property statistics (Admin only)
export const getPropertyStats = asyncHandler(async (req, res) => {
  const totalProperties = await Property.count();
  const activeProperties = await Property.count({ where: { is_active: true } });
  const inactiveProperties = await Property.count({
    where: { is_active: false },
  });

  // Get properties by transaction type
  const propertiesByTransactionType = await Property.findAll({
    attributes: ['transaction_type', [fn('COUNT', col('id')), 'count']],
    group: ['transaction_type'],
    order: [[literal('count'), 'DESC']],
    limit: 10,
  });

  // Get properties by property type
  const propertiesByPropertyType = await Property.findAll({
    attributes: ['property_type', [fn('COUNT', col('id')), 'count']],
    group: ['property_type'],
    order: [[literal('count'), 'DESC']],
    limit: 10,
  });

  // Get properties by condition
  const propertiesByCondition = await Property.findAll({
    attributes: ['property_condition', [fn('COUNT', col('id')), 'count']],
    group: ['property_condition'],
    order: [[literal('count'), 'DESC']],
    limit: 10,
  });

  // Get recent property records (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentProperties = await Property.count({
    where: {
      createdAt: {
        [Op.gte]: thirtyDaysAgo,
      },
    },
  });

  // Get properties with upcoming reservation dates (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const upcomingReservations = await Property.count({
    where: {
      reservation_date: {
        [Op.between]: [new Date(), thirtyDaysFromNow],
      },
      is_active: true,
    },
  });

  const stats = {
    totalProperties,
    activeProperties,
    inactiveProperties,
    recentProperties,
    upcomingReservations,
    propertiesByTransactionType: propertiesByTransactionType.map(item => ({
      type: item.transaction_type,
      count: parseInt(item.dataValues.count),
    })),
    propertiesByPropertyType: propertiesByPropertyType.map(item => ({
      type: item.property_type,
      count: parseInt(item.dataValues.count),
    })),
    propertiesByCondition: propertiesByCondition.map(item => ({
      condition: item.property_condition,
      count: parseInt(item.dataValues.count),
    })),
  };

  return res
    .status(200)
    .json(
      createApiResponse(
        true,
        'Property statistics retrieved successfully',
        stats
      )
    );
}, 'Failed to retrieve property statistics');
