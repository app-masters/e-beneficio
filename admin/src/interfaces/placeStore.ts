export interface PlaceStore {
  readonly id?: number | string;
  cityId: number | string;
  placeId: number | string;
  title: string;
  address: string;
  cnpj: string;
  responsibleName?: string;
  responsiblePhone?: string;
  responsibleEmail?: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
