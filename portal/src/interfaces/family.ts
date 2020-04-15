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
