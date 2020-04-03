export interface User {
  readonly id?: number;
  cityId: number;
  placeStoreId?: number;
  name?: string;
  cpf: string;
  role: string;
  email?: string;
  password: string;
  active: boolean;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
