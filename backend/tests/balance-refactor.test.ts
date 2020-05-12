import moment from 'moment';
import db, { sequelize } from '../src/schemas';
import * as consumptionModel from '../src/models/consumptions';
import { Family } from '../src/schemas/families';
import { getFamilyGroupByCode } from '../src/utils/constraints';
import { Benefit } from '../src/schemas/benefits';
import { PlaceStore } from '../src/schemas/placeStores';
import { Institution } from '../src/schemas/institutions';
import { Dependent } from '../src/schemas/depedents';
import { Consumption } from '../src/schemas/consumptions';

afterAll(() => {
  sequelize.close();
});

const testName = 'balance';

const dependent = {
  familyId: 0,
  name: 'JOÃO DA SILVA',
  nis: Math.floor(Math.random() * 10000000000).toString(),
  birthday: moment('01/01/2010', 'DD/MM/YYYY').toDate(),
  schoolName: 'Escola Municipal José Calógeras'
} as Dependent;
let createdDependent: Dependent;

const family = {
  code: Math.floor(Math.random() * 10000000).toString(),
  groupName: getFamilyGroupByCode(1)?.key,
  responsibleName: 'TEREZA DE JESUS',
  responsibleBirthday: moment('01/01/1980', 'DD/MM/YYYY').toDate(),
  responsibleNis: Math.floor(Math.random() * 10000000000).toString(),
  responsibleMotherName: 'MARIA RITA DA SILVA',
  cityId: 0
} as Family;
let createdFamily: Family;

const benefit = {
  title: '[CAD25123] Auxilio merenda',
  groupName: getFamilyGroupByCode(0)?.key,
  month: moment().month() + 1,
  year: moment().year(),
  value: 500,
  institutionId: 0
} as Benefit;
let createdBenefit: Benefit;
let placeStore: PlaceStore;
let institution: Institution;

test(`[${testName}] Create mock data`, async () => {
  [placeStore] = await db.placeStores.findAll({ limit: 1 });
  [institution] = await db.institutions.findAll({ where: { cityId: placeStore.cityId as number }, limit: 1 });
  benefit.institutionId = institution.id as number;
  createdFamily = await db.families.create({ ...family, cityId: placeStore.cityId });
  expect(createdFamily).toBeDefined();
  expect(createdFamily.id).toBeDefined();
  createdDependent = await db.dependents.create({ ...dependent, familyId: createdFamily.id });
  expect(createdDependent).toBeDefined();
  expect(createdDependent.id).toBeDefined();
  createdBenefit = await db.benefits.create({ ...benefit });
  expect(createdBenefit).toBeDefined();
  expect(createdBenefit.id).toBeDefined();
});

test(`[${testName}] Get balance report`, async () => {
  const report = await consumptionModel.getBalanceReport(createdFamily.cityId);
  expect(report).toBeDefined();
  expect(report.length).toBeGreaterThan(0);
  const reportFamily = report.find((item) => item.id === createdFamily.id);
  expect(reportFamily).toBeDefined();
  if (reportFamily) {
    expect(reportFamily.balance).toBeGreaterThan(createdBenefit.value);
  }
});

test(`[${testName}] Consume all the balance`, async () => {
  const balance = await consumptionModel.getFamilyDependentBalance(createdFamily);
  const consumption: Consumption = {
    value: balance,
    familyId: createdFamily.id as number,
    nfce: new Date().getTime().toString(),
    placeStoreId: placeStore.id as number
  };
  const cratedConsumption = await consumptionModel.addConsumption(consumption, placeStore.id as number);
  expect(cratedConsumption).toBeDefined();
  expect(cratedConsumption.id).toBeDefined();
  expect(cratedConsumption.value).toBe(balance);
  const newBalance = await consumptionModel.getFamilyDependentBalance(createdFamily);
  expect(newBalance).toBe(0);
});

test(`[${testName}] Consume more than the balance`, async () => {
  const consumption: Consumption = {
    value: 100,
    familyId: createdFamily.id as number,
    nfce: new Date().getTime().toString(),
    placeStoreId: placeStore.id as number
  };
  try {
    const cratedConsumption = await consumptionModel.addConsumption(consumption, placeStore.id as number);
    expect(cratedConsumption).toBe('Should not create consumption');
  } catch (error) {
    expect(error).toBeDefined();
    expect(error.status).toBe(422);
  }
});
