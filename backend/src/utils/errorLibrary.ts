export interface ErrorResult {
  name: string;
  message: string; // User friendly
  key: string;
  error?: string | Error;
  status?: number;
}

const errorLibrary: { [key: string]: Pick<ErrorResult, 'status' | 'message'> } = {
  noUserFoundWithValidEmail: {
    status: 404,
    message: 'Nenhum usuário encontrado com este email'
  },
  invalidUser: {
    status: 401,
    message: 'Usuário inválido'
  },
  invalidCredentials: {
    status: 401,
    message: 'Credenciais inválidas'
  },
  inactiveUserLogging: {
    status: 401,
    message: 'Usuário inativo'
  }
};

/**
 * Generating error object using a defined key
 * @param key - key that will be used to find the correct error on the library
 * @param error - Original error
 * @returns ErrorResult
 */
export const getError = (key: string, error?: Error): ErrorResult => {
  return {
    name: 'Backend error',
    error, // Returning original error
    status: 500, // Default status code
    message: 'Something unexpected happened', // Default message
    key,
    ...errorLibrary[key]
  };
};
