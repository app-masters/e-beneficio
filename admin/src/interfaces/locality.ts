export interface Locality {
  readonly id?: number;
  cityId: number;
  placeId: number;
  title: string;
  address: string;
  cnpj: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
