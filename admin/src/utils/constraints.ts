export const APP_PREFIX = 'admin';

export const PERSIST_KEY = `${APP_PREFIX}/root`;

export const localStorageConstraints = {
  SIDEBAR_COLLAPSED: `${APP_PREFIX}/sidebar:collapsed`,
  AUTH_TOKEN: `${APP_PREFIX}/authToken`,
  REFRESH_TOKEN: `${APP_PREFIX}/refreshToken`
};

export const familyGroupList = {
  children: { code: 0, title: 'Dependentes matriculados na rede pública' },
  // 'extreme-poverty': { code: 1, title: 'Extrema pobreza' },
  // 'poverty-line': { code: 2, title: 'Linha da pobreza' },
  // cad: { code: 3, title: 'Perfil CAD único' }
};

export const roleList = {
  admin: { title: 'Administrador' },
  operator: { title: 'Operador' },
  manager: { title: 'Gerente' },
  financial: { title: 'Financeiro' }
};
