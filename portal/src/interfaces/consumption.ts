export interface Consumption {
  readonly id?: number | string;
  familyId: number | string;
  placeStoreId: number | string;
  nfce: string;
  value: number;
  proofImageUrl?: string;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
