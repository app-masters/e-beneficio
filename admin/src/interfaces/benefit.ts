import { familyGroupList } from './../utils/constraints';

export interface Benefit {
  readonly id?: number;
  institutionId: number;
  groupName: string;
  title: string;
  month: number;
  year: number;
  value: keyof typeof familyGroupList;
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
}
