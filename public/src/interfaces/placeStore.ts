import { Place } from './place';

export interface PlaceStore {
  readonly id?: number | string;
  cityId: number | string;
  placeId: number | string;
  title: string;
  address: string;
  cnpj: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  place: Place;
}
