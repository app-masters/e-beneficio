export interface Product {
  readonly id?: number | string;
  name: string;
  isValid: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
