import sequelize from '../configs/database.js';
import User from './user.model.js';
import Client from './client.model.js';

// Define associations
Client.associate({ User });

const db = {
  sequelize,
  User,
  Client,
};

export default db;
