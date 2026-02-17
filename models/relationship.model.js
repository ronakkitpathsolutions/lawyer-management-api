import { DataTypes } from 'sequelize';
import { date, z } from 'zod';
import VALIDATION_MESSAGES from '../utils/constants/messages.js';
import { validateWithZod } from '../utils/helper.js';
import sequelize from '../configs/database.js';
import { RELATIONSHIP_TEXTS } from '../utils/constants/variables.js';
import { Relationship as RelationshipValidation } from '../utils/validations/index.js';

const Relationship = sequelize.define(
  'Relationship',
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
          msg: VALIDATION_MESSAGES.RELATIONSHIP.CLIENT_ID.REQUIRED,
        },
        isInt: {
          msg: VALIDATION_MESSAGES.RELATIONSHIP.CLIENT_ID.INVALID,
        },
      },
    },
    member_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: VALIDATION_MESSAGES.RELATIONSHIP.MEMBER_NAME.EMPTY,
        },
        len: {
          args: [2, 100],
          msg: VALIDATION_MESSAGES.RELATIONSHIP.MEMBER_NAME.TOO_LONG,
        },
      },
    },
    member_email: {
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
    relationship: {
      type: DataTypes.ENUM(
        'spouse',
        'child',
        'parent',
        'sibling',
        'dependent',
        'other'
      ),
      allowNull: true,
      validate: {
        isIn: {
          args: [
            ['spouse', 'child', 'parent', 'sibling', 'dependent', 'other'],
          ],
          msg:
            VALIDATION_MESSAGES.RELATIONSHIP.RELATIONSHIP?.INVALID ||
            'Invalid relationship',
        },
      },
      field: 'relationship',
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
    has_yellow_or_pink_card: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      validate: {
        isBoolean: {
          msg:
            VALIDATION_MESSAGES.CLIENT.HAS_CARD?.INVALID ||
            'Invalid value for card field',
        },
      },
      field: 'has_yellow_or_pink_card',
    },
    has_bought_property_in_thailand: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      validate: {
        isBoolean: {
          msg:
            VALIDATION_MESSAGES.CLIENT.HAS_PROPERTY?.INVALID ||
            'Invalid value for property field',
        },
      },
      field: 'has_bought_property_in_thailand',
    },
    contact_number: {
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
      field: 'contact_number',
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
  },
  {
    tableName: 'relationships',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        fields: ['client_id'],
      },
      {
        fields: ['member_name'],
      },
      {
        fields: ['member_email'],
      },
      {
        fields: ['relationship'],
      },
    ],
  }
);

// Static methods for common queries
Relationship.findByClientId = function (clientId, options = {}) {
  return this.findAll({
    where: { client_id: clientId },
    order: [['createdAt', 'DESC']],
    ...options,
  });
};

// Pagination with search functionality
Relationship.paginateWithSearch = async function ({
  page = 1,
  limit = 10,
  search = '',
  sortBy = 'createdAt',
  sortOrder = 'DESC',
  client_id,
  relationship,
  member_name,
  member_email,
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
    const matchingRelationships = RELATIONSHIP_TEXTS.filter(visa =>
      visa.toLowerCase().includes(searchLower)
    );

    const searchConditions = [];

    // Add exact matches for ENUM fields
    if (matchingRelationships.length > 0) {
      searchConditions.push({
        relationship: { [Op.in]: matchingRelationships },
      });
    }

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

  // Validate sortBy field to prevent SQL injection
  const allowedSortFields = [
    'id',
    'client_id',
    'member_name',
    'member_email',
    'relationship',
    'createdAt',
    'updatedAt',
  ];

  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase())
    ? sortOrder.toUpperCase()
    : 'DESC';

  // For ENUM fields, use custom sorting based on display labels
  let orderClause;
  if (validSortBy === 'relationship') {
    orderClause = [
      [validSortBy, validSortOrder],
      ['createdAt', 'DESC'],
    ];
  } else {
    orderClause = [[validSortBy, validSortOrder]];
  }
  const { count, rows } = await this.findAndCountAll({
    where: whereConditions,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: orderClause,
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
Relationship.validateCreateData = function (data) {
  return validateWithZod(RelationshipValidation.schemas.create, data);
};

Relationship.validateUpdateData = function (data) {
  return validateWithZod(RelationshipValidation.schemas.update, data);
};

Relationship.validateSearchData = function (data) {
  return validateWithZod(RelationshipValidation.schemas.search, data);
};

export default Relationship;
