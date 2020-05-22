import levenshtein from 'js-levenshtein';

/**
 * Correctly comparing names
 * @param name string
 * @param nameToCompare another string
 * @param checkMarried check if name is just includes
 * @returns boolean
 */
export const compareNames = (name: string, nameToCompare: string, checkMarried?: boolean) => {
  if (!name || !nameToCompare || name.length < 1 || nameToCompare.length < 1) return false;

  // Removing common name mismatches causes
  name = name
    .trim()
    .toLocaleLowerCase()
    .replace(/ d?[a|e|i|o|u]s? /g, ' ');
  nameToCompare = nameToCompare
    .trim()
    .toLocaleLowerCase()
    .replace(/ d?[a|e|i|o|u]s? /g, ' ');

  const distance = levenshtein(name, nameToCompare);
  if (distance > 2) {
    // Too much distance, trying to find married names
    if (checkMarried && name.indexOf(nameToCompare) > -1) return true;
    else if (checkMarried && nameToCompare.indexOf(name) > -1) return true;
    return false;
  }
  return true;

  return name.trim().toLocaleLowerCase() === nameToCompare.trim().toLocaleLowerCase();
};
