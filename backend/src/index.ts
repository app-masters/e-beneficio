// Imports
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import fileUpload from 'express-fileupload';
import path from 'path';

import routes from './routes';
import logging from './utils/logging';
import { setupCronjobs } from './cron';

require('dotenv').config();

if (!process.env.DB_DATABASE) {
  throw new Error('.env file not loaded (or empty DB_DATABASE)');
}

process.env.BASEPATH = __dirname;

/**
 * Initializing API
 * @param listeningCallback - Function to run after server is listening
 * @param errorCallback - On Error callback
 */
const init = (listeningCallback: () => void, errorCallback: (error: Error) => void): void => {
  try {
    // App Configurations
    const app = express();
    app.use(
      cors({
        origin: /.*/,
        allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type'],
        maxAge: 86400, // NOTICE: 1 day
        credentials: true
      })
    );
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
    app.use(bodyParser.json({ limit: '50mb' }));

    app.use(
      fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
        useTempFiles: true,
        tempFileDir: `${path.dirname(__dirname)}/database/storage/`,
        preserveExtension: true
      })
    );
    // Initializing routes
    app.use(routes);

    // Server start
    const server = http.createServer(app);
    server.setTimeout(6 * 60 * 60 * 1000);
    server.listen(process.env.PORT);
    server.on('error', errorCallback);
    server.on('listening', listeningCallback);

    //Setup the server cronjobs
    if (process.env.CONSUMPTION_TYPE !== 'product') {
      setupCronjobs();
    }
  } catch (e) {
    errorCallback(e);
  }
};

interface ErrnoException extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}

/**
 * API initialization failure callback
 * @param error  - Initialization error object
 */
const onError = (error: ErrnoException): void => {
  logging.critical(error);
  if (error.syscall !== 'listen') {
    throw error;
  }
  switch (error.code) {
    case 'EACCES':
      console.error('Port requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error('Port is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/**
 * API initialization success callback
 */
const onListening = (): void => {
  logging.info(`Up and running - ${process.env.NODE_ENV} - http://${process.env.HOSTNAME}:${process.env.PORT}`);
};

// Initializing API
init(onListening, onError);
