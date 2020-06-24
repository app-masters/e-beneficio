import { Product } from './product';

export interface ConsumptionProducts {
  readonly id?: number | string;
  productId: number | string;
  consumptionsId: number | string;
  amount: number;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  //Join
  product: Product;
}
