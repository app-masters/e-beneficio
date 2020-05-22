import Rollbar, { LogResult } from 'rollbar';

const config = {
  accessToken: process.env.ROLLBAR_SERVER_TOKEN,
  environment: process.env.NODE_ENV,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    client: {
      javascript: {
        ['source_map_enabled']: true,
        ['guess_uncaught_frames']: true
      }
    }
  }
};
const rollbar = new Rollbar(config);

// Get last commit from current branch and set on rollbar
if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test' && !process.env.COMMIT_SHA) {
  console.log(`Rollbar pointed to git commit: ${process.env.COMMIT_SHA}`);
  rollbar.configure({
    payload: { client: { javascript: { ['code_version']: process.env.COMMIT_SHA } } }
  });
}

const logging = {
  log: (message: string | object, object?: string | object): LogResult => {
    if (process.env.NODE_ENV !== 'test') console.log(message, object || '');
    return rollbar.log(message, object || '');
  },
  error: (message: string | object, object?: string | object): LogResult => {
    if (process.env.NODE_ENV !== 'test') console.error(message, object || '');
    return rollbar.error(message, object || '');
  },
  info: (message: string, object?: string | object): LogResult => {
    if (process.env.NODE_ENV !== 'test') console.log(message, object || '');
    return rollbar.info(message, object || '');
  },
  debug: (message: string, object?: string | object): LogResult => {
    if (process.env.NODE_ENV !== 'test') console.log('rollbar.debug', message, object || '');
    return rollbar.debug(message, object || '');
  },
  critical: (message: string | object, object?: string | object): LogResult => {
    if (process.env.NODE_ENV !== 'test') console.error(message, object || '');
    return rollbar.critical(message, object || '');
  },
  warn: (message: string, object?: string | object): LogResult => {
    if (process.env.NODE_ENV !== 'test') console.log(message, object || '');
    return rollbar.warn(message, object || '');
  },
  warning: (message: string, object?: string | object): LogResult => {
    if (process.env.NODE_ENV !== 'test') console.log(message, object || '');
    return rollbar.warning(message, object || '');
  }
};
export default logging;
