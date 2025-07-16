import { DataTypes } from 'sequelize';
import { z } from 'zod';
import { Client as ClientValidation } from '../utils/validations/index.js';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import { validateWithZod } from '../utils/helper.js';
import sequelize from '../configs/database.js';

const Client = sequelize.define(
  'Client',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: VALIDATION_MESSAGES.CLIENT.NAME.EMPTY,
        },
        len: {
          args: [2, 100],
          msg: VALIDATION_MESSAGES.CLIENT.NAME.TOO_LONG,
        },
      },
    },
    family_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: VALIDATION_MESSAGES.CLIENT.FAMILY_NAME.EMPTY,
        },
        len: {
          args: [2, 100],
          msg: VALIDATION_MESSAGES.CLIENT.FAMILY_NAME.TOO_LONG,
        },
      },
      field: 'family_name',
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: {
        msg: VALIDATION_MESSAGES.CLIENT.EMAIL.ALREADY_EXISTS,
      },
      validate: {
        isEmail: {
          msg: VALIDATION_MESSAGES.CLIENT.EMAIL.INVALID,
        },
        notEmpty: {
          msg: VALIDATION_MESSAGES.CLIENT.EMAIL.REQUIRED,
        },
      },
    },
    passport_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: {
        msg: VALIDATION_MESSAGES.CLIENT.PASSPORT_NUMBER.ALREADY_EXISTS,
      },
      validate: {
        len: {
          args: [6, 20],
          msg: VALIDATION_MESSAGES.CLIENT.PASSPORT_NUMBER.TOO_SHORT,
        },
        is: {
          args: /^[A-Z0-9]+$/,
          msg: VALIDATION_MESSAGES.CLIENT.PASSPORT_NUMBER.INVALID,
        },
      },
      field: 'passport_number',
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: VALIDATION_MESSAGES.CLIENT.NATIONALITY.REQUIRED,
        },
        len: {
          args: [2, 50],
          msg: VALIDATION_MESSAGES.CLIENT.NATIONALITY.INVALID,
        },
      },
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: VALIDATION_MESSAGES.CLIENT.DOB.INVALID,
        },
        isBefore: {
          args: new Date().toISOString().split('T')[0],
          msg: VALIDATION_MESSAGES.CLIENT.DOB.FUTURE_DATE,
        },
      },
      field: 'date_of_birth',
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [18],
          msg: VALIDATION_MESSAGES.CLIENT.AGE.TOO_YOUNG,
        },
        max: {
          args: [120],
          msg: VALIDATION_MESSAGES.CLIENT.AGE.TOO_OLD,
        },
      },
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: VALIDATION_MESSAGES.CLIENT.PHONE_NUMBER.REQUIRED,
        },
        len: {
          args: [10, 15],
          msg: VALIDATION_MESSAGES.CLIENT.PHONE_NUMBER.TOO_SHORT,
        },
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: VALIDATION_MESSAGES.CLIENT.PHONE_NUMBER.INVALID,
        },
      },
      field: 'phone_number',
    },
    current_address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: VALIDATION_MESSAGES.CLIENT.CURRENT_ADDRESS.REQUIRED,
        },
        len: {
          args: [10, 500],
          msg: VALIDATION_MESSAGES.CLIENT.CURRENT_ADDRESS.INVALID_LENGTH,
        },
      },
      field: 'current_address',
    },
    address_in_thailand: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: VALIDATION_MESSAGES.CLIENT.ADDRESS_IN_THAILAND.TOO_LONG,
        },
      },
      field: 'address_in_thailand',
    },
    whatsapp: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        len: {
          args: [10, 15],
          msg: VALIDATION_MESSAGES.CLIENT.WHATSAPP.INVALID_LENGTH,
        },
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: VALIDATION_MESSAGES.CLIENT.WHATSAPP.INVALID,
        },
      },
    },
    line: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [3, 50],
          msg: VALIDATION_MESSAGES.CLIENT.LINE.INVALID_LENGTH,
        },
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: {
          msg: VALIDATION_MESSAGES.CLIENT.IS_ACTIVE.INVALID,
        },
      },
      field: 'is_active',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      field: 'created_by',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    tableName: 'clients',
    timestamps: true,
    hooks: {
      beforeSave: async client => {
        // Calculate age if date_of_birth is provided
        if (client.date_of_birth) {
          const today = new Date();
          const birthDate = new Date(client.date_of_birth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          client.age = age;
        } else {
          // If no date_of_birth is provided, set age to null
          client.age = null;
        }
      },
    },
  }
);

// Define associations
Client.associate = function (models) {
  // Client belongs to User (created_by)
  Client.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator',
  });
};

// Instance methods
Client.prototype.toJSON = function () {
  const client = this.get();
  return client;
};

// Class methods
Client.findByEmail = async function (email) {
  return await this.findOne({
    where: { email },
  });
};

Client.findByPassportNumber = async function (passport_number) {
  return await this.findOne({
    where: { passport_number },
  });
};

Client.paginateWithSearch = async function (options = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    filters = {},
    where = {},
    include = [],
    attributes,
  } = options;

  // Import Op here to avoid circular dependency issues
  const { Op } = await import('sequelize');

  // Validate and sanitize parameters
  const pageNumber = Math.max(1, parseInt(page, 10));
  const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10))); // Max 100 items per page
  const offset = (pageNumber - 1) * limitNumber;

  // Validate sort order
  const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
    ? sortOrder.toUpperCase()
    : 'DESC';

  try {
    // Build where clause
    const whereClause = { ...where };

    // Add search functionality
    if (search && search.trim()) {
      const searchTerm = search.trim();
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { family_name: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } },
        { passport_number: { [Op.iLike]: `%${searchTerm}%` } },
        { nationality: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    // Add filters
    if (filters && typeof filters === 'object') {
      Object.keys(filters).forEach(key => {
        if (
          filters[key] !== undefined &&
          filters[key] !== null &&
          filters[key] !== ''
        ) {
          whereClause[key] = filters[key];
        }
      });
    }

    // Build order clause
    const orderClause = [[sortBy, validSortOrder]];

    // Get total count
    const totalCount = await this.count({
      where: whereClause,
      include: include.length > 0 ? include : undefined,
    });

    // Get paginated data
    const clients = await this.findAll({
      where: whereClause,
      include,
      order: orderClause,
      limit: limitNumber,
      offset,
      attributes,
    });

    return {
      result: clients,
      pagination: {
        currentPage: pageNumber,
        totalCount,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
      },
    };
  } catch (error) {
    throw new Error(`Pagination failed: ${error.message}`);
  }
};

// Zod validation methods
Client.validateCreateData = function (data) {
  return validateWithZod(ClientValidation.schemas.create, data);
};

Client.validateUpdateData = function (data) {
  return validateWithZod(ClientValidation.schemas.update, data);
};

Client.validateSearchData = function (data) {
  return validateWithZod(ClientValidation.schemas.search, data);
};

// Static method to get validation schemas
Client.getValidationSchemas = function () {
  return ClientValidation.schemas;
};

// Static method to get a specific validation schema
Client.getValidationSchema = function (schemaName) {
  return ClientValidation.schemas[schemaName];
};

export default Client;
