import bcrypt from 'bcryptjs';

/**
 * Check if a string is a bcrypt hash
 *
 * @param value string to be checked
 * @returns True if the value match a hash pattern
 */
export const isHash = (value: string | null | undefined) => {
  if (!value) return false;
  return !!value.match(/^\$2[ayb]\$.{56}$/);
};

/**
 * Encript a string using bcrypt hash
 * @param value String to be encripted
 * @returns Encripted string
 */
export const encrypt = (value: string) => {
  return bcrypt.hash(value, 8);
};

/**
 * Compares a string with a hash
 *
 * @param value String to be checked
 * @param hash Target value
 * @returns Returns whether the string match the hash value
 */
export const compareHash = (value: string, hash: string) => {
  return bcrypt.compare(value, hash);
};
