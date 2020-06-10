import { Locality } from './locality';

export interface Report {
  readonly id?: number | string;
  createdAt?: number | Date | null;
  data: ConsumptionPlace[];
  total: number;
}

export interface ConsumptionPlace {
  readonly id?: number | string;
  createdAt?: number | Date | null;
  placeStoreId: string;
  total: number;
  placeStore: Locality;
}
