export interface Place {
  readonly id?: number | string;
  cityId: number | string;
  title: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
