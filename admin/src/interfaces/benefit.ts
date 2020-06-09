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
  benefitProduct?: {
    id: number | string;
    productsId: number | string;
    amount: number;
  }[];
}
