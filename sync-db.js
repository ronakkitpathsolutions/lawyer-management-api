import sequelize from './configs/database.js';
import './models/index.js'; // Import all models

async function syncDatabase() {
  try {
    console.log('🔄 Connecting to database...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Force sync - this will drop and recreate all tables
    console.log('🔄 Synchronizing database models...');
    await sequelize.sync({ alter: true }); // Use alter to create tables if they don't exist
    console.log('✅ Database models synchronized successfully.');
    console.log('📊 All tables have been created.');

    // Close connection
    await sequelize.close();
    console.log('🔒 Database connection closed.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    process.exit(1);
  }
}

syncDatabase();
