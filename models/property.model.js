import { DataTypes } from 'sequelize';
import { Property as PropertyValidation } from '../utils/validations/index.js';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import { validateWithZod } from '../utils/helper.js';
import {
  TYPE_OF_PROPERTY_TEXTS,
  FURNITURE_INCLUDED_TEXTS,
  COST_SHARING_TEXTS,
  PROPERTY_CONDITION_TEXTS,
  HOUSE_TITLE_TEXTS,
  LAND_TITLE_TEXTS,
  DECLARED_LAND_OFFICE_PRICE_TEXTS,
  PLACE_OF_PAYMENT_TEXTS,
  HANDOVER_DATE_TEXTS,
  INTENDED_CLOSING_DATE_TEXTS,
} from '../utils/constants/variables.js';
import sequelize from '../configs/database.js';

const Property = sequelize.define(
  'Property',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        notNull: {
          msg: VALIDATION_MESSAGES.PROPERTY.CLIENT_ID.REQUIRED,
        },
        isInt: {
          msg: VALIDATION_MESSAGES.PROPERTY.CLIENT_ID.INVALID,
        },
      },
    },
    property_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: VALIDATION_MESSAGES.PROPERTY.PROPERTY_NAME.REQUIRED,
        },
        len: {
          args: [2, 100],
          msg: VALIDATION_MESSAGES.PROPERTY.PROPERTY_NAME.TOO_SHORT,
        },
      },
    },
    agent_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [2, 100],
          msg: VALIDATION_MESSAGES.PROPERTY.AGENT_NAME.TOO_SHORT,
        },
      },
    },
    broker_company: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [2, 100],
          msg: VALIDATION_MESSAGES.PROPERTY.BROKER_COMPANY.TOO_SHORT,
        },
      },
    },
    transaction_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    property_type: {
      type: DataTypes.ENUM(...TYPE_OF_PROPERTY_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [TYPE_OF_PROPERTY_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.PROPERTY_TYPE.INVALID,
        },
      },
    },
    reservation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: VALIDATION_MESSAGES.PROPERTY.RESERVATION_DATE.INVALID,
        },
      },
    },
    intended_closing_date: {
      type: DataTypes.ENUM(...INTENDED_CLOSING_DATE_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [INTENDED_CLOSING_DATE_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.INTENDED_CLOSING_DATE.INVALID,
        },
      },
    },
    intended_closing_date_specific: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: VALIDATION_MESSAGES.PROPERTY.INTENDED_CLOSING_DATE_SPECIFIC
            .INVALID,
        },
      },
    },
    handover_date: {
      type: DataTypes.ENUM(...HANDOVER_DATE_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [HANDOVER_DATE_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.HANDOVER_DATE.INVALID,
        },
      },
    },
    selling_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        isDecimal: {
          msg: VALIDATION_MESSAGES.PROPERTY.SELLING_PRICE.INVALID,
        },
        min: {
          args: [0],
          msg: VALIDATION_MESSAGES.PROPERTY.SELLING_PRICE.MUST_BE_POSITIVE,
        },
      },
    },
    deposit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        isDecimal: {
          msg: VALIDATION_MESSAGES.PROPERTY.DEPOSIT.INVALID,
        },
        min: {
          args: [0],
          msg: VALIDATION_MESSAGES.PROPERTY.DEPOSIT.MUST_BE_POSITIVE,
        },
      },
    },
    intermediary_payment: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        isDecimal: {
          msg: VALIDATION_MESSAGES.PROPERTY.INTERMEDIARY_PAYMENT.INVALID,
        },
        min: {
          args: [0],
          msg: VALIDATION_MESSAGES.PROPERTY.INTERMEDIARY_PAYMENT
            .MUST_BE_POSITIVE,
        },
      },
    },
    closing_payment: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        isDecimal: {
          msg: VALIDATION_MESSAGES.PROPERTY.CLOSING_PAYMENT.INVALID,
        },
        min: {
          args: [0],
          msg: VALIDATION_MESSAGES.PROPERTY.CLOSING_PAYMENT.MUST_BE_POSITIVE,
        },
      },
    },
    acceptable_method_of_payment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    place_of_payment: {
      type: DataTypes.ENUM(...PLACE_OF_PAYMENT_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [PLACE_OF_PAYMENT_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.PLACE_OF_PAYMENT.INVALID,
        },
      },
    },
    property_condition: {
      type: DataTypes.ENUM(...PROPERTY_CONDITION_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [PROPERTY_CONDITION_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.PROPERTY_CONDITION.INVALID,
        },
      },
    },
    house_warranty: {
      type: DataTypes.ENUM(...['yes', 'no']),
      allowNull: true,
      validate: {
        isIn: {
          args: [['yes', 'no']],
          msg: VALIDATION_MESSAGES.PROPERTY.HOUSE_WARRANTY.INVALID,
        },
      },
    },
    warranty_condition: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [2, 500],
          msg:
            VALIDATION_MESSAGES.PROPERTY.WARRANTY_CONDITION.TOO_SHORT +
            ' and ' +
            VALIDATION_MESSAGES.PROPERTY.WARRANTY_CONDITION.TOO_LONG,
        },
      },
    },
    warranty_term: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [2, 100],
          msg:
            VALIDATION_MESSAGES.PROPERTY.WARRANTY_TERM.TOO_SHORT +
            ' and ' +
            VALIDATION_MESSAGES.PROPERTY.WARRANTY_TERM.TOO_LONG,
        },
      },
    },
    furniture_included: {
      type: DataTypes.ENUM(...FURNITURE_INCLUDED_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [FURNITURE_INCLUDED_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.FURNITURE_INCLUDED.INVALID,
        },
      },
    },
    // Cost sharing fields
    transfer_fee: {
      type: DataTypes.ENUM(...COST_SHARING_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [COST_SHARING_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.TRANSFER_FEE.INVALID,
        },
      },
    },
    withholding_tax: {
      type: DataTypes.ENUM(...COST_SHARING_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [COST_SHARING_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.WITHHOLDING_TAX.INVALID,
        },
      },
    },
    business_tax: {
      type: DataTypes.ENUM(...COST_SHARING_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [COST_SHARING_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.BUSINESS_TAX.INVALID,
        },
      },
    },
    lease_registration_fee: {
      type: DataTypes.ENUM(...COST_SHARING_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [COST_SHARING_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.LEASE_REGISTRATION_FEE.INVALID,
        },
      },
    },
    mortgage_fee: {
      type: DataTypes.ENUM(...COST_SHARING_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [COST_SHARING_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.MORTGAGE_FEE.INVALID,
        },
      },
    },
    usufruct_registration_fee: {
      type: DataTypes.ENUM(...COST_SHARING_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [COST_SHARING_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.USUFRUCT_REGISTRATION_FEE.INVALID,
        },
      },
    },
    servitude_registration_fee: {
      type: DataTypes.ENUM(...COST_SHARING_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [COST_SHARING_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.SERVITUDE_REGISTRATION_FEE.INVALID,
        },
      },
    },
    declared_land_office_price: {
      type: DataTypes.ENUM(...DECLARED_LAND_OFFICE_PRICE_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [DECLARED_LAND_OFFICE_PRICE_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.DECLARED_LAND_OFFICE_PRICE.INVALID,
        },
      },
    },
    // Documentation attachment fields
    land_title: {
      type: DataTypes.ENUM(...LAND_TITLE_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [LAND_TITLE_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.LAND_TITLE.INVALID,
        },
      },
    },
    land_title_document: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: VALIDATION_MESSAGES.PROPERTY.LAND_TITLE_DOCUMENT.TOO_LONG,
        },
      },
    },
    house_title: {
      type: DataTypes.ENUM(...HOUSE_TITLE_TEXTS),
      allowNull: true,
      validate: {
        isIn: {
          args: [HOUSE_TITLE_TEXTS],
          msg: VALIDATION_MESSAGES.PROPERTY.HOUSE_TITLE.INVALID,
        },
      },
    },
    house_title_document: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: VALIDATION_MESSAGES.PROPERTY.HOUSE_TITLE_DOCUMENT.TOO_LONG,
        },
      },
    },
    house_registration_book: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: VALIDATION_MESSAGES.PROPERTY.HOUSE_REGISTRATION_BOOK.TOO_LONG,
        },
      },
    },
    land_lease_agreement: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: VALIDATION_MESSAGES.PROPERTY.LAND_LEASE_AGREEMENT.TOO_LONG,
        },
      },
    },
    repair_details: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: VALIDATION_MESSAGES.PROPERTY.REPAIR_DETAILS.TOO_LONG,
        },
      },
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'properties',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['client_id'],
      },
      {
        fields: ['created_by'],
      },
      {
        fields: ['transaction_type'],
      },
      {
        fields: ['property_type'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

// Static methods for common queries
Property.findByClientId = function (clientId, options = {}) {
  return this.findAll({
    where: { client_id: clientId },
    order: [['createdAt', 'DESC']],
    ...options,
  });
};

Property.findActiveByClientId = function (clientId, options = {}) {
  return this.findAll({
    where: { client_id: clientId, is_active: true },
    order: [['createdAt', 'DESC']],
    ...options,
  });
};

// Pagination with search functionality
Property.paginateWithSearch = async function ({
  page = 1,
  limit = 10,
  search = '',
  sortBy = 'createdAt',
  sortOrder = 'DESC',
  client_id,
  transaction_type,
  property_type,
  is_active,
  include = [],
  ...options
}) {
  const { Op } = await import('sequelize');

  const offset = (page - 1) * limit;
  const whereConditions = {};

  // Add search conditions
  if (search) {
    const searchConditions = [];

    // Text/STRING fields - use iLike for case-insensitive search
    const textFields = [
      'property_name',
      'agent_name',
      'broker_company',
      'repair_details',
    ];

    textFields.forEach(field => {
      searchConditions.push({
        [field]: { [Op.iLike]: `%${search}%` },
      });
    });

    // TEXT field - transaction_type
    searchConditions.push({
      transaction_type: { [Op.iLike]: `%${search}%` },
    });

    // ENUM field - property_type (use exact match with Op.in for multiple values)
    // For ENUM fields, we need to check if search term matches any of the possible values
    if (TYPE_OF_PROPERTY_TEXTS && TYPE_OF_PROPERTY_TEXTS.length > 0) {
      const matchingPropertyTypes = TYPE_OF_PROPERTY_TEXTS.filter(type =>
        type.toLowerCase().includes(search.toLowerCase())
      );

      if (matchingPropertyTypes.length > 0) {
        searchConditions.push({
          property_type: { [Op.in]: matchingPropertyTypes },
        });
      }
    }

    whereConditions[Op.or] = searchConditions;
  }

  // Add filter conditions
  if (client_id) {
    whereConditions.client_id = client_id;
  }

  if (transaction_type) {
    whereConditions.transaction_type = transaction_type;
  }

  if (property_type) {
    whereConditions.property_type = property_type;
  }

  if (is_active !== undefined) {
    whereConditions.is_active = is_active;
  }

  // Validate sortBy field to prevent SQL injection
  const allowedSortFields = [
    'id',
    'property_name',
    'agent_name',
    'broker_company',
    'transaction_type',
    'property_type',
    'reservation_date',
    'selling_price',
    'deposit',
    'createdAt',
    'updatedAt',
  ];

  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
    ? sortOrder.toUpperCase()
    : 'DESC';

  const { count, rows } = await this.findAndCountAll({
    where: whereConditions,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[validSortBy, validSortOrder]],
    include,
    ...options,
  });

  return {
    result: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit),
    },
  };
};

// Validation methods
Property.validateCreateData = function (data) {
  return validateWithZod(PropertyValidation.schemas.create, data);
};

Property.validateUpdateData = function (data) {
  return validateWithZod(PropertyValidation.schemas.update, data);
};

Property.validateSearchData = function (data) {
  return validateWithZod(PropertyValidation.schemas.search, data);
};

export default Property;
