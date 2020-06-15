import { Dependent } from './dependent';

export interface Family {
  readonly id?: number | string;
  cityId: number | string;
  placeStoreId?: number | string;
  code: string;
  groupName: string;
  responsibleName?: string;
  responsibleNis?: string;
  responsibleBirthday?: Date;
  responsibleMotherName?: string;
  //New attributes
  isRegisteredInPerson?: boolean;
  totalSalary?: number;
  isOnAnotherProgram?: boolean;
  isOnGovernProgram?: boolean;
  houseType?: string;
  numberOfRooms?: number;
  haveSewage?: boolean;
  sewageComment?: string;
  address?: string;
  phone?: string;
  phone2?: string;
  deactivatedAt?: number | Date | null;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  // Join
  dependents: Dependent[];
  balance?: number;
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
