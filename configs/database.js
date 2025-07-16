import { Sequelize } from 'sequelize';
import { ENV } from './index.js';

// Validate required environment variables
if (!ENV.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.log(
    'Please create a .env file with DATABASE_URL=postgresql://username:password@localhost:5432/database_name'
  );
  process.exit(1);
}

const sequelize = new Sequelize(ENV.DATABASE_URL, {
  dialect: 'postgres',
  logging: ENV.NODE_ENV === 'development' ? console.log : false,

  // Enhanced pool configuration
  pool: {
    max: 20, // Maximum number of connections in pool
    min: 5, // Minimum number of connections in pool
    acquire: 60000, // Maximum time (ms) that pool will try to get connection before throwing error
    idle: 10000, // Maximum time (ms) that a connection can be idle before being released
    evict: 1000, // Time interval (ms) to run eviction to remove idle connections
    handleDisconnects: true, // Automatically handle disconnects
  },

  // Connection retry configuration
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
    max: 5, // Increased retry attempts
  },

  // Additional connection options
  dialectOptions: {
    ssl:
      ENV.NODE_ENV === 'production'
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
    connectTimeout: 60000,
    socketTimeout: 60000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
  },

  // Query timeout
  query: {
    timeout: 60000,
  },

  // Timezone configuration
  timezone: '+00:00',

  // Disable automatic pluralization of table names
  define: {
    freezeTableName: true,
    timestamps: true,
    underscored: true,
  },
});

// Cache pool configuration to avoid multiple accesses
let cachedPoolConfig = null;

// Pool connection
const poolConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    // Cache and log pool configuration
    cachedPoolConfig = sequelize.options.pool;
    console.log(
      `📊 Pool Config - Max: ${cachedPoolConfig.max}, Min: ${cachedPoolConfig.min}, Acquire: ${cachedPoolConfig.acquire}ms`
    );

    //     if (ENV.NODE_ENV === 'development') {
    //   console.log('🔄 Synchronizing database models...');
    //   await sequelize.sync({ alter: true }); // Create tables if they don't exist
    //   console.log('📊 Database models synchronized.');
    // }

    // Return pool config for further use
    return {
      success: true,
      poolConfig: cachedPoolConfig,
    };
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    throw error;
  }
};

// Graceful shutdown handler
const closeConnection = async () => {
  try {
    console.log('🔄 Closing database connections...');
    await sequelize.close();
    console.log('✅ Database connections closed successfully.');
  } catch (error) {
    console.error('❌ Error closing database connections:', error.message);
    throw error;
  }
};

// Export connection test and close functions along with sequelize
export { poolConnection, closeConnection };
export default sequelize;
