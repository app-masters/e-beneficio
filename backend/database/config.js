require('dotenv').config();

const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: !!(process.env.DB_SHOW_LOG && process.env.DB_SHOW_LOG !== 'false') ? console.log : false,
  pool: { maxConnections: 10, minConnections: 1 },
  dialectOptions: {
    ssl: !!process.env.DB_SSLMODE,
    sslmode: process.env.DB_SSLMODE ? process.env.DB_SSLMODE : null,
    dateStrings: true,
    typeCast: true
  }
};

module.exports = config;
