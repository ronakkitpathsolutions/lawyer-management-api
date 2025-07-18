import { DataTypes } from 'sequelize';
import { Visa as VisaValidation } from '../utils/validations/index.js';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import { validateWithZod } from '../utils/helper.js';
import { EXISTING_VISA, WISHED_VISA } from '../utils/constants/variables.js';
import sequelize from '../configs/database.js';

const Visa = sequelize.define(
  'Visa',
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
          msg: VALIDATION_MESSAGES.VISA.CLIENT_ID.REQUIRED,
        },
        isInt: {
          msg: VALIDATION_MESSAGES.VISA.CLIENT_ID.INVALID,
        },
      },
    },
    existing_visa: {
      type: DataTypes.ENUM(...EXISTING_VISA),
      allowNull: false,
      validate: {
        notNull: {
          msg: VALIDATION_MESSAGES.VISA.EXISTING_VISA.REQUIRED,
        },
        isIn: {
          args: [EXISTING_VISA],
          msg: VALIDATION_MESSAGES.VISA.EXISTING_VISA.INVALID,
        },
      },
    },
    wished_visa: {
      type: DataTypes.ENUM(...WISHED_VISA),
      allowNull: false,
      validate: {
        notNull: {
          msg: VALIDATION_MESSAGES.VISA.WISHED_VISA.REQUIRED,
        },
        isIn: {
          args: [WISHED_VISA],
          msg: VALIDATION_MESSAGES.VISA.WISHED_VISA.INVALID,
        },
      },
    },
    latest_entry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: VALIDATION_MESSAGES.VISA.LATEST_ENTRY_DATE.INVALID,
        },
      },
    },
    existing_visa_expiry: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: VALIDATION_MESSAGES.VISA.EXISTING_VISA_EXPIRY.INVALID,
        },
      },
    },
    intended_departure_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: VALIDATION_MESSAGES.VISA.INTENDED_DEPARTURE_DATE.INVALID,
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
    tableName: 'visas',
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
        fields: ['existing_visa'],
      },
      {
        fields: ['wished_visa'],
      },
      {
        fields: ['is_active'],
      },
    ],
  }
);

// Static methods for common queries
Visa.findByClientId = function (clientId, options = {}) {
  return this.findAll({
    where: { client_id: clientId },
    order: [['createdAt', 'DESC']],
    ...options,
  });
};

Visa.findActiveByClientId = function (clientId, options = {}) {
  return this.findAll({
    where: { client_id: clientId, is_active: true },
    order: [['createdAt', 'DESC']],
    ...options,
  });
};

// Pagination with search functionality
Visa.paginateWithSearch = async function ({
  page = 1,
  limit = 10,
  search = '',
  client_id,
  existing_visa,
  wished_visa,
  is_active,
  include = [],
  ...options
}) {
  const { Op } = await import('sequelize');

  const offset = (page - 1) * limit;
  const whereConditions = {};

  // Add search conditions
  if (search) {
    // For ENUM fields, we need to filter the available values that match the search
    const searchLower = search.toLowerCase();

    const matchingExistingVisas = EXISTING_VISA.filter(visa =>
      visa.toLowerCase().includes(searchLower)
    );
    const matchingWishedVisas = WISHED_VISA.filter(visa =>
      visa.toLowerCase().includes(searchLower)
    );

    const searchConditions = [];

    // Add exact matches for ENUM fields
    if (matchingExistingVisas.length > 0) {
      searchConditions.push({
        existing_visa: { [Op.in]: matchingExistingVisas },
      });
    }

    if (matchingWishedVisas.length > 0) {
      searchConditions.push({ wished_visa: { [Op.in]: matchingWishedVisas } });
    }

    // If we have any matching conditions, use them
    if (searchConditions.length > 0) {
      whereConditions[Op.or] = searchConditions;
    } else {
      // If no ENUM values match the search, return empty result
      // Add an impossible condition to ensure no records are returned
      whereConditions[Op.and] = [{ id: { [Op.eq]: null } }];
    }
  }

  // Add filter conditions
  if (client_id) {
    whereConditions.client_id = client_id;
  }

  if (existing_visa) {
    whereConditions.existing_visa = existing_visa;
  }

  if (wished_visa) {
    whereConditions.wished_visa = wished_visa;
  }

  if (is_active !== undefined) {
    whereConditions.is_active = is_active;
  }

  const { count, rows } = await this.findAndCountAll({
    where: whereConditions,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
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
Visa.validateCreateData = function (data) {
  return validateWithZod(VisaValidation.schemas.create, data);
};

Visa.validateUpdateData = function (data) {
  return validateWithZod(VisaValidation.schemas.update, data);
};

Visa.validateSearchData = function (data) {
  return validateWithZod(VisaValidation.schemas.search, data);
};

export default Visa;
