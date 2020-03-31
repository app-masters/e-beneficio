// Avoid showing string based operator error
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deprecations = require('sequelize/lib/utils/deprecations');
deprecations.noStringOperators = () => void 0;

require('dotenv').config();
const Op = require('sequelize').Op;
const operatorsAliases = Object.entries(Op).reduce((prev, [key, op]) => {
  prev[key] = op;
  return prev;
}, {});
const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: !!(process.env.DB_SHOW_LOG && process.env.DB_SHOW_LOG !== 'false') ? console.log : false,
  pool: { maxConnections: 10, minConnections: 1 },
  timezone: 'America/Maceio',
  dialectOptions: {
    ssl: !!process.env.DB_SSLMODE,
    sslmode: process.env.DB_SSLMODE ? process.env.DB_SSLMODE : null,
    dateStrings: true,
    typeCast: true
  },
  operatorsAliases
};

module.exports = config;
