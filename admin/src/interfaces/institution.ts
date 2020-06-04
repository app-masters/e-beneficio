export interface Institution {
  readonly id?: number | string;
  cityId: number | string;
  title: string;
  address: string;
  district: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
