import sequelize from '../configs/database.js';
import User from './user.model.js';
import Client from './client.model.js';
import Visa from './visa.model.js';

// Define associations
Client.associate({ User });

// Define Visa associations
Visa.belongsTo(Client, {
  foreignKey: 'client_id',
  as: 'client',
});

Visa.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

Client.hasMany(Visa, {
  foreignKey: 'client_id',
  as: 'visas',
});

User.hasMany(Visa, {
  foreignKey: 'created_by',
  as: 'createdVisas',
});

const db = {
  sequelize,
  User,
  Client,
  Visa,
};

export default db;
