import sequelize from '../configs/database.js';
import User from './user.model.js';

const db = {
  sequelize,
  User,
};

export default db;
