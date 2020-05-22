export const APP_PREFIX = 'portal';

export const PERSIST_KEY = `${APP_PREFIX}/root`;

export const localStorageConstraints = {
  SIDEBAR_COLLAPSED: `${APP_PREFIX}/sidebar:collapsed`,
  AUTH_TOKEN: `${APP_PREFIX}/authToken`,
  REFRESH_TOKEN: `${APP_PREFIX}/refreshToken`
};
