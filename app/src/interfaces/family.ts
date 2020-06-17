import { Dependent } from './dependent';
export interface FamilyProductConsumption {
  product: { id: number | string; name: string };
  amountAvailable: number;
  amountGranted: number;
  amountConsumed: number;
  consume?: number;
}

export interface Family {
  readonly id?: number | string;
  cityId: number | string;
  code: string;
  groupId: number | string;
  responsibleName?: string;
  responsibleNis?: string;
  responsibleBirthday?: Date;
  responsibleMotherName?: string;
  deactivatedAt?: number | Date | null;
  //New attributes
  isRegisteredInPerson?: boolean;
  totalSalary?: number;
  isOnAnotherProgram?: boolean;
  isOnGovernProgram?: boolean;
  address?: string;
  houseType?: string;
  numberOfRooms?: number;
  haveSewage?: boolean;
  sewageComment?: string;
  //
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  // Extra data
  dependents?: Dependent[];
  balance: number | FamilyProductConsumption[];
}
