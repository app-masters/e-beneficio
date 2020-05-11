import levenshtein from 'js-levenshtein';

/**
 * Correctly comparing names
 * @param name string
 * @param nameToCompare another string
 * @returns boolean
 */
export const compareNames = (name: string, nameToCompare: string) => {
  if (!name || !nameToCompare || name.length < 1 || nameToCompare.length < 1) return false;

  return levenshtein(name.trim().toLocaleLowerCase(), nameToCompare.trim().toLocaleLowerCase()) < 3;

  return name.trim().toLocaleLowerCase() === nameToCompare.trim().toLocaleLowerCase();
};
