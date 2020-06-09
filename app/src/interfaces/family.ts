import { Dependent } from './Dependent';

export interface Family {
  readonly id?: number | string;
  cityId: number | string;
  code: string;
  groupName: string;
  responsibleName: string;
  responsibleNis: string;
  responsibleBirthday: Date;
  responsibleMotherName: string;
  //New attributes
  isRegisteredInPerson: boolean;
  totalSalary: number;
  isOnAnotherProgram: boolean;
  isOnGovernProgram: boolean;
  address: string;
  houseType: string;
  numberOfRooms: number;
  haveSewage: boolean;
  sewageComment: string;
  //
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  // Extra data
  balance: number;
  dependents?: Dependent[];
}
