import Rollbar from 'rollbar';
import { env } from '../env';

const localStorageKey = 'e-beneficio-portal-log-user';

/**
 * List with the last date record for a given log message
 */
const lastRecord: { [key: string]: Date } = {};

/**
 * Checks whether a message has been logged in the last hour or not
 * @param message Info, Log, Warn, Error or Critical log message
 * @returns true if this message has already being logged in the last hour
 */
const loggedLastHour = (message: string | object) => {
  // Make sure the message is a string to be used as a key
  const key = JSON.stringify(message);
  const lastRecordDate = lastRecord[key];
  // If the message was logged before one hour ago, it is considered to false
  const alreadyLogged = lastRecordDate && lastRecordDate >= new Date(Date.now() - 1000 * 60 * 60);
  if (!alreadyLogged) lastRecord[key] = new Date();
  return alreadyLogged;
};

/**
 * Setup Rollbar
 */
const createRollbar = (): Rollbar => {

  const rollbar = new Rollbar({
    accessToken: env.REACT_APP_ENV_ROLLBAR_SERVER_TOKEN,
    environment: env.REACT_APP_ENV_ROLLBAR_ENVIRONMENT,
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      client: {
        javascript: {
          source_map_enabled: true,
          guess_uncaught_frames: true
        }
      }
    }
  });
  if (env.REACT_APP_ENV !== 'development' && env.REACT_APP_COMMIT_SHA) {
    rollbar.configure({
      payload: { client: { javascript: { code_version: env.REACT_APP_COMMIT_SHA } } }
    });
  }
  return rollbar;
};

export const logging = {
  log: (message: Rollbar.LogArgument, object = '', justOnce?: boolean): Rollbar.LogResult => {
    console.log(message, object);
    if (justOnce && loggedLastHour(message)) return { uuid: '' };
    const rollbar = createRollbar();
    return rollbar.log(message, object);
  },
  error: (message: Rollbar.LogArgument, object = '', justOnce?: boolean): Rollbar.LogResult => {
    console.error(message, object);
    if (justOnce && loggedLastHour(message)) return { uuid: '' };
    const rollbar = createRollbar();
    return rollbar.error(message, object);
  },
  info: (message: Rollbar.LogArgument, object = '', justOnce?: boolean): Rollbar.LogResult => {
    console.info(message, object);
    if (justOnce && loggedLastHour(message)) return { uuid: '' };
    const rollbar = createRollbar();
    return rollbar.info(message, object);
  },
  debug: (message: Rollbar.LogArgument, object = '', justOnce?: boolean): Rollbar.LogResult => {
    console.debug(message, object);
    if (justOnce && loggedLastHour(message)) return { uuid: '' };
    const rollbar = createRollbar();
    return rollbar.debug(message, object);
  },
  critical: (message: Rollbar.LogArgument, object = '', justOnce?: boolean): Rollbar.LogResult => {
    console.error(message, object);
    if (justOnce && loggedLastHour(message)) return { uuid: '' };
    const rollbar = createRollbar();
    return rollbar.critical(message, object);
  },
  warn: (message: Rollbar.LogArgument, object = '', justOnce?: boolean): Rollbar.LogResult => {
    console.warn(message, object);
    if (justOnce && loggedLastHour(message)) return { uuid: '' };
    const rollbar = createRollbar();
    return rollbar.warn(message, object);
  },
  warning: (message: Rollbar.LogArgument, object = '', justOnce?: boolean): Rollbar.LogResult => {
    console.warn(message, object);
    if (justOnce && loggedLastHour(message)) return { uuid: '' };
    const rollbar = createRollbar();
    return rollbar.warning(message, object);
  },
  setPerson: (id: string | number, name?: string | undefined, email?: string | undefined) => {
    // Save the user log data in the local storage, so the rollbar can use it next call
    localStorage.setItem(localStorageKey, JSON.stringify({ id, name, email }));
  },
  removePerson: () => {
    // Remove the user log data from the local storage
    localStorage.removeItem(localStorageKey);
  }
};
