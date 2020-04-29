/**
 * Correctly comparing names
 * @param name string
 * @param nameToCompare another string
 * @returns boolean
 */
export const compareNames = (name: string, nameToCompare: string) => {
  if (!name || !nameToCompare || name.length < 1 || nameToCompare.length < 1) return false;

  return name.trim().toLocaleLowerCase() === nameToCompare.trim().toLocaleLowerCase();
};
