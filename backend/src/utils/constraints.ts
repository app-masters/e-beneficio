export const familyGroupList = [
  { code: 1, title: 'Extrema pobreza', key: 'extreme-poverty' },
  { code: 2, title: 'Linha da pobreza', key: 'poverty-line' },
  { code: 3, title: 'Perfil CAD único', key: 'cad' },
  { code: 4, title: 'Perfil CAD único', key: 'cad' } // 3 and 4 will be grouped
];

/**
 * Return family group object by the code
 * @param code defined family code
 * @returns family code item or undefined
 */
export const getFamilyGroupByCode = (code: number | string) => {
  return familyGroupList.find((group) => group.code.toString() === code.toString());
};

/**
 * Return family group object by the key
 * @param key defined object key
 * @returns family code item or undefined
 */
export const getFamilyGroupByKey = (key: string) => {
  return familyGroupList.find((group) => group.key === key);
};
