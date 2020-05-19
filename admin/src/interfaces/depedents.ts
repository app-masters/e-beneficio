export interface Dependent {
  readonly id?: number | string;
  familyId: number | string;
  name: string;
  nis: string;
  birthday: Date | string;
  schoolName?: string;
  deactivatedAt?: number | Date | null;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}