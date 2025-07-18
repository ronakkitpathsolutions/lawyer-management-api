import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import { User as UserValidation } from '../utils/validations/index.js';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import { ENV } from '../configs/index.js';
import { validateWithZod } from '../utils/helper.js';
import sequelize from '../configs/database.js';

const User = sequelize.define(
  'User',
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
          msg: VALIDATION_MESSAGES.USER.NAME.EMPTY,
        },
        len: {
          args: [2, 100],
          msg: VALIDATION_MESSAGES.USER.NAME.TOO_LONG,
        },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: {
        msg: VALIDATION_MESSAGES.USER.EMAIL.ALREADY_EXISTS,
      },
      validate: {
        isEmail: {
          msg: VALIDATION_MESSAGES.USER.EMAIL.INVALID,
        },
        notEmpty: {
          msg: VALIDATION_MESSAGES.USER.EMAIL.REQUIRED,
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: VALIDATION_MESSAGES.USER.PASSWORD.REQUIRED,
        },
        len: {
          args: [6, 255],
          msg: VALIDATION_MESSAGES.USER.PASSWORD.TOO_SHORT,
        },
      },
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        len: {
          args: [10, 15],
          msg: VALIDATION_MESSAGES.USER.PHONE_NUMBER.TOO_SHORT,
        },
        is: {
          args: /^[\+]?[1-9][\d]{0,15}$/,
          msg: VALIDATION_MESSAGES.USER.PHONE_NUMBER.INVALID,
        },
      },
      field: 'phone_number',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        isBoolean: {
          msg: VALIDATION_MESSAGES.USER.IS_ACTIVE.INVALID,
        },
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        notNull: {
          msg: VALIDATION_MESSAGES.USER.ROLE.REQUIRED,
        },
      },
    },
    refresh_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [10, 255],
          msg: VALIDATION_MESSAGES.AUTH.TOKEN.INVALID,
        },
      },
    },
    profile: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: VALIDATION_MESSAGES.USER.PROFILE.TOO_LONG,
        },
      },
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
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async user => {
        if (user.password) {
          user.password = await bcrypt.hash(
            user.password,
            ENV.HASH_SALT_ROUNDS
          );
        }
      },
      beforeUpdate: async user => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(
            user.password,
            ENV.HASH_SALT_ROUNDS
          );
        }
      },
    },
  }
);

// Instance methods
User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function () {
  const user = this.get();
  delete user.password; // Remove password from JSON output
  return user;
};

// Class methods
User.findByEmail = async function (email) {
  return await this.findOne({
    where: { email },
  });
};

User.paginateWithSearch = async function (options = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    filters = {},
    includeRole = true,
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
        { email: { [Op.iLike]: `%${searchTerm}%` } },
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

    // Build include array
    const includeArray = [...include];
    if (includeRole) {
      includeArray.push({
        model: sequelize.models.Role,
        as: 'role',
        attributes: ['id', 'name'],
      });
    }

    // Build order clause
    const orderClause = [[sortBy, validSortOrder]];

    // Get total count
    const totalCount = await this.count({
      where: whereClause,
      include: includeArray.length > 0 ? includeArray : undefined,
    });

    // Get paginated data
    const users = await this.findAll({
      where: whereClause,
      include: includeArray,
      order: orderClause,
      limit: limitNumber,
      offset,
      attributes,
    });

    return {
      result: users,
      pagination: {
        currentPage: pageNumber,
        totalCount,
        limit: limitNumber,
      },
    };
  } catch (error) {
    throw new Error(`Pagination failed: ${error.message}`);
  }
};

// Zod validation methods
User.validateCreateData = function (data) {
  return validateWithZod(UserValidation.schemas.create, data);
};

User.validateUpdateData = function (data) {
  return validateWithZod(UserValidation.schemas.update, data);
};

User.validateLoginData = function (data) {
  return validateWithZod(UserValidation.schemas.login, data);
};

User.validateRegisterData = function (data) {
  return validateWithZod(UserValidation.schemas.register, data);
};

User.validatePasswordChange = function (data) {
  return validateWithZod(UserValidation.schemas.changePassword, data);
};

User.validateForgotPassword = function (data) {
  return validateWithZod(UserValidation.schemas.forgotPassword, data);
};

User.validateResetPassword = function (data) {
  return validateWithZod(UserValidation.schemas.resetPassword, data);
};

User.validateUpdateProfile = function (data) {
  return validateWithZod(UserValidation.schemas.updateProfile, data);
};

// Static method to get validation schemas
User.getValidationSchemas = function () {
  return UserValidation.schemas;
};

// Static method to get a specific validation schema
User.getValidationSchema = function (schemaName) {
  return UserValidation.schemas[schemaName];
};

export default User;
