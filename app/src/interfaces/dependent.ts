export interface Dependent {
  readonly id?: number | string;
  familyId: number | string;
  name: string;
  nis: string;
  birthday: Date | string;
  schoolName?: string;
  deactivatedAt?: number | Date | null;
  //New attributes
  isResponsible?: boolean;
  rg: string;
  cpf: string;
  phone: string;
  profession: string;
  isHired: boolean; // allowNull
  isFormal: boolean; // allowNull
  salary: number;
  email: string;
  //
  createdAt?: number | Date | null;
  updatedAt?: number | Date | null;
  deletedAt?: number | Date | null;
  //extra
  type?: string;
}
