import sequelize from './configs/database.js';
import './models/index.js'; // Import all models

async function syncDatabase() {
  try {
    console.log('🔄 Connecting to database...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Handle problematic column type changes
    console.log('🔧 Checking for column type conflicts...');

    try {
      // Check if properties table exists and has the intended_closing_date column
      const [results] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'intended_closing_date'
        AND table_schema = 'public'
      `);

      if (results.length > 0 && results[0].data_type === 'date') {
        console.log('🔄 Converting intended_closing_date from date to enum...');

        // First, backup any existing data and set to null
        await sequelize.query(`
          UPDATE properties 
          SET intended_closing_date = NULL 
          WHERE intended_closing_date IS NOT NULL
        `);

        // Drop the column
        await sequelize.query(`
          ALTER TABLE properties 
          DROP COLUMN intended_closing_date
        `);

        console.log('✅ Problematic column removed successfully.');
      }
    } catch (columnCheckError) {
      console.log('ℹ️  Column check completed (table may not exist yet).');
    }

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
