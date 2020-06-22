import { PlaceStore } from './placeStore';
import { Dependent } from './dependent';

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
  placeStore: PlaceStore;
}

export interface ReportConsumptionFamily {
  readonly id?: number | string;
  familyId: number | string;
  responsible: Dependent;
  createdAt: string | Date | null;
  placeStoreId: number | string;
  neverConsumed: boolean;
  consumedAll: boolean;
}
