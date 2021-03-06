export const familyGroupList = [
  { id: 1, code: 0, title: 'Bolsa família com filho na escola pública', key: 'children' },
  { id: 2, code: 1, title: 'Extrema pobreza', key: 'extreme-poverty' },
  { id: 3, code: 2, title: 'Linha da pobreza', key: 'poverty-line' },
  { id: 4, code: 3, title: 'Perfil CAD único', key: 'cad' },
  { id: 4, code: 4, title: 'Perfil CAD único', key: 'cad' } // 3 and 4 will be grouped
];

/**
 * Return family group object by the code
 * @param code defined family code
 * @returns family code item or undefined
 */
export const getFamilyGroupByCode = (code: number | string) => {
  return familyGroupList.find((group) => group.code.toString() === code.toString()) || familyGroupList[0];
};

/**
 * Return family group object by the key
 * @param key defined object key
 * @returns family code item or undefined
 */
export const getFamilyGroupByKey = (key: string) => {
  return familyGroupList.find((group) => group.key === key);
};

export const allowedNISList = [] as string[];

export const allowedNamesList = [] as string[];
