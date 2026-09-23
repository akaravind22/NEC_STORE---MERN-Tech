const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbName = process.env.DB_NAME || 'nec_store';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dialect = process.env.DB_DIALECT || 'mysql';

let sequelize;

if (process.env.USE_SQLITE_FALLBACK === 'true') {
  // Primary MySQL configuration with fallback capability
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: dialect,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: dialect,
    logging: false
  });
}

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[DB] Connected successfully to MySQL (${dbName} at ${dbHost}:${dbPort})`);
  } catch (err) {
    if (process.env.USE_SQLITE_FALLBACK === 'true') {
      console.warn(`[DB Warning] MySQL connection failed (${err.message}). Switching to SQLite local database fallback for instant development...`);
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../nec_store.sqlite'),
        logging: false
      });
      await sequelize.authenticate();
      console.log('[DB] SQLite database fallback connected successfully.');
    } else {
      console.error('[DB Error] Unable to connect to MySQL database:', err);
      throw err;
    }
  }
  return sequelize;
};

module.exports = {
  sequelize,
  initializeDatabase
};
