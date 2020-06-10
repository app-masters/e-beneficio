export interface Family {
  readonly id?: number | string;
  school: string;
  responsibleName: string;
  responsibleBirthday: Date;
  // Extra data
  balance: number;
}
