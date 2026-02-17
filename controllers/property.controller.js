import ExcelJS from 'exceljs';
import {
  createApiResponse,
  asyncHandler,
  PROPERTY_EXPORT_COLUMN_WIDTHS,
  TYPE_OF_TRANSACTION_MAP,
  TYPE_OF_PROPERTY_MAP,
  HANDOVER_DATE_MAP,
  INTENDED_CLOSING_DATE_MAP,
  ACCEPTABLE_PAYMENT_METHODS_MAP,
  PLACE_OF_PAYMENT_MAP,
  PROPERTY_CONDITION_MAP,
  YES_NO_MAP,
  FURNITURE_INCLUDED_MAP,
  BUYER_SELLER_COST_MAP,
  MORTGAGOR_MORTGAGEE_COST_MAP,
  USUFRUCTUARY_OWNER_COST_MAP,
  SERVITUDE_COST_MAP,
  DECLARED_LAND_OFFICE_PRICE_MAP,
  LAND_TITLE_MAP,
  HOUSE_TITLE_MAP,
  capitalize,
} from '../utils/helper.js';
import { deleteS3File } from '../utils/s3-helper.js';
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

  // Add document S3 URLs if files were uploaded
  if (req.propertyDocuments) {
    Object.keys(req.propertyDocuments).forEach(documentType => {
      propertyData[documentType] = req.propertyDocuments[documentType].s3Url;
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

// Get property records by client ID with pagination and search (Admin only)
export const getPropertiesByClientId = asyncHandler(async (req, res) => {
  const { client_id } = req.params;
  const {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    transaction_type,
    property_type,
    is_active,
  } = req.validatedQuery || req.query;

  // Use default values if validatedQuery is not available
  const queryParams = {
    page: page || 1,
    limit: limit || 10,
    search: search || '',
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'DESC',
    transaction_type,
    property_type,
    is_active,
  };

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

  // Use the pagination method with client_id filter
  const result = await Property.paginateWithSearch({
    page: parseInt(queryParams.page),
    limit: parseInt(queryParams.limit),
    search: queryParams.search,
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder,
    client_id: parseInt(client_id),
    transaction_type: queryParams.transaction_type,
    property_type: queryParams.property_type,
    is_active: queryParams.is_active,
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
    createApiResponse(true, 'Client property records retrieved successfully', {
      ...result,
    })
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

  // Add document S3 URLs if files were uploaded and delete old documents from S3
  if (req.propertyDocuments) {
    const fieldsToUpdate = Object.keys(req.propertyDocuments);

    // Delete old documents from S3 for the fields being updated
    for (const documentType of fieldsToUpdate) {
      const oldDocumentUrl = property[documentType];
      if (oldDocumentUrl) {
        try {
          await deleteS3File(oldDocumentUrl);
        } catch (error) {
          console.error(`Error deleting old S3 file: ${oldDocumentUrl}`, error);
          // Continue execution even if deletion fails
        }
      }
    }

    // Set new document S3 URLs
    fieldsToUpdate.forEach(documentType => {
      updateData[documentType] = req.propertyDocuments[documentType].s3Url;
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

  // Delete all document files from S3
  const documentFields = [
    'land_title_document',
    'house_title_document',
    'house_registration_book',
    'land_lease_agreement',
  ];

  for (const field of documentFields) {
    const documentUrl = property[field];
    if (documentUrl) {
      try {
        await deleteS3File(documentUrl);
      } catch (error) {
        console.error(`Error deleting S3 file: ${documentUrl}`, error);
        // Continue execution even if deletion fails
      }
    }
  }

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

export const exportPropertiesExcel = asyncHandler(async (req, res) => {
  const { client_id } = req.params;
  const result = await Property.paginateWithSearch({
    page: 1,
    limit: 1000000, // export all
    client_id: parseInt(client_id),
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['name', 'family_name', 'email', 'nationality'],
      },
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Properties');

  const attributes = Object.keys(Property.rawAttributes);

  // Optional: exclude some fields if needed
  const excludedFields = ['createdAt', 'updatedAt', 'client_id'];
  const filteredAttributes = attributes.filter(
    field => !excludedFields.includes(field)
  );

  const formatHeader = field =>
    field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();

  worksheet.columns = filteredAttributes.map(field => ({
    header: formatHeader(field),
    key: field,
    width: PROPERTY_EXPORT_COLUMN_WIDTHS[field] || 20,
  }));

  const formattedRows = result.result.map(property => ({
    id: property.id,
    property_name: property.property_name || '',
    agent_name: property.createdBy?.name || '',
    broker_company: property.broker_company || '',
    transaction_type:
      String(property.transaction_type)
        .split(',')
        .map(type => capitalize(type.trim()))
        .join(', ') || '',
    property_type: TYPE_OF_PROPERTY_MAP[property.property_type] || '',
    reservation_date: property.reservation_date || '',
    intended_closing_date:
      INTENDED_CLOSING_DATE_MAP[property.intended_closing_date] || '',
    intended_closing_date_specific:
      property.intended_closing_date_specific || '',
    handover_date: HANDOVER_DATE_MAP[property.handover_date] || '',
    selling_price: property.selling_price || '',
    deposit: property.deposit || '',
    intermediary_payment: property.intermediary_payment || '',
    closing_payment: property.closing_payment || '',
    acceptable_method_of_payment:
      ACCEPTABLE_PAYMENT_METHODS_MAP[property.acceptable_method_of_payment] ||
      '',
    place_of_payment: PLACE_OF_PAYMENT_MAP[property.place_of_payment] || '',
    property_condition:
      PROPERTY_CONDITION_MAP[property.property_condition] || '',
    house_warranty: YES_NO_MAP[property.house_warranty] || '',
    warranty_condition: property.warranty_condition || '',
    warranty_term: property.warranty_term || '',
    furniture_included:
      FURNITURE_INCLUDED_MAP[property.furniture_included] || '',
    transfer_fee: BUYER_SELLER_COST_MAP[property.transfer_fee] || '',
    withholding_tax: BUYER_SELLER_COST_MAP[property.withholding_tax] || '',
    business_tax: BUYER_SELLER_COST_MAP[property.business_tax] || '',
    lease_registration_fee:
      BUYER_SELLER_COST_MAP[property.lease_registration_fee] || '',
    mortgage_fee: MORTGAGOR_MORTGAGEE_COST_MAP[property.mortgage_fee] || '',
    usufruct_registration_fee:
      USUFRUCTUARY_OWNER_COST_MAP[property.usufruct_registration_fee] || '',
    servitude_registration_fee:
      SERVITUDE_COST_MAP[property.servitude_registration_fee] || '',
    declared_land_office_price:
      DECLARED_LAND_OFFICE_PRICE_MAP[property.declared_land_office_price] || '',
    land_title: LAND_TITLE_MAP[property.land_title] || '',
    land_title_document: property.land_title_document || '',
    house_title: HOUSE_TITLE_MAP[property.house_title] || '',
    house_title_document: property.house_title_document || '',
    house_registration_book: property.house_registration_book || '',
    land_lease_agreement: property.land_lease_agreement || '',
    repair_details: property.repair_details || '',
    remarks: property.remarks || '',
    is_active:
      property.is_active !== undefined
        ? property.is_active
          ? 'Active'
          : 'Inactive'
        : property.is_active,
  }));

  worksheet.addRows(formattedRows);
  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  const lastColumnLetter = worksheet.getColumn(worksheet.columnCount).letter;

  worksheet.autoFilter = {
    from: 'A1',
    to: `${lastColumnLetter}1`,
  };

  [
    'reservation_date',
    'intended_closing_date',
    'intended_closing_date_specific',
    'handover_date',
  ].forEach(field => {
    if (worksheet.getColumn(field)) {
      worksheet.getColumn(field).numFmt = 'yyyy-mm-dd';
    }
  });

  [
    'selling_price',
    'deposit',
    'intermediary_payment',
    'closing_payment',
  ].forEach(field => {
    if (worksheet.getColumn(field)) {
      worksheet.getColumn(field).numFmt = '#,##0.00';
    }
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  res.setHeader('Content-Disposition', 'attachment; filename=properties.xlsx');

  await workbook.xlsx.write(res);
  res.end();
}, 'Failed to export properties to Excel');
