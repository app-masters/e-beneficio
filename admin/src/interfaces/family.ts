export interface Family {
  readonly id?: number | string;
  cityId: number | string;
  code: string;
  groupName: string;
  responsibleName: string;
  responsibleNis: string;
  responsibleBirthday: Date;
  responsibleMotherName: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  // Extra data
  balance: number;
}

export type ImportReport = {
  status: 'Em espera' | 'Finalizado' | 'Falhou' | 'Lendo arquivos' | 'Filtrando dados' | 'Salvando' | 'Cruzando dados';
  message?: string;
  percentage?: number;
  cityId?: number | string;
  inProgress?: boolean;
  originalFamilyCount?: number;
  originalSislameCount?: number;
  originalNurseryCount?: number;
  filteredFamilyCount?: number;
  grantedFamilyCount?: number;
  aboveAgeFamilyCount?: number;
  aboveAgeSislameCount?: number;
  foundOnlyNameFamilyCount?: number;
  grantedAnotherParentCount?: number;
  notFoundFamilyCount?: number;
  dependentsCount?: number;
  duplicatedCount?: number;
  sislameWithoutParentCount?: number;
  fourteenOrLessGrantedCount?: number;
  fourteenOrLessFilteredCount?: number;
};
