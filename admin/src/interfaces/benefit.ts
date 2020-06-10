import { familyGroupList } from './../utils/constraints';

export interface Benefit {
  readonly id?: number;
  institutionId: number;
  groupName: string;
  title: string;
  date: Date;
  value: keyof typeof familyGroupList;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  benefitProducts?: {
    id: number | string;
    productId: number | string;
    amount: number;
  }[];
}
