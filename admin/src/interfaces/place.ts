export interface Place {
  readonly id?: number;
  cityId: number;
  title: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}