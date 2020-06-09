import moment from 'moment';
import db, { sequelize } from '../src/schemas';
import * as consumptionModel from '../src/models/consumptions';
import { Family } from '../src/schemas/families';
import { getFamilyGroupByCode } from '../src/utils/constraints';
import { Benefit } from '../src/schemas/benefits';
import { Consumption } from '../src/schemas/consumptions';
import { PlaceStore } from '../src/schemas/placeStores';

afterAll(() => {
  sequelize.close();
});

const testName = 'consumption';

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
  title: '[CAD25123] Auxilio municipal de alimentação',
  groupName: getFamilyGroupByCode(1)?.key,
  date: moment().toDate(),
  value: 500,
  institutionId: 0
} as Benefit;
let createdBenefit: Benefit;
let placeStore: PlaceStore;

test(`[${testName}] Create mock data`, async () => {
  [placeStore] = await db.placeStores.findAll({ limit: 1 });
  const [institution] = await db.institutions.findAll({ where: { cityId: placeStore.cityId as number }, limit: 1 });
  createdFamily = await db.families.create({ ...family, cityId: placeStore.cityId });
  expect(createdFamily).toBeDefined();
  expect(createdFamily.id).toBeDefined();
  createdBenefit = await db.benefits.create({ ...benefit, institutionId: institution.id });
  expect(createdBenefit).toBeDefined();
  expect(createdBenefit.id).toBeDefined();
});

test(`[${testName}] Get family balance`, async () => {
  const balance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(balance).toBeGreaterThanOrEqual(benefit.value as number);
});

test(`[${testName}] Consume all the balance`, async () => {
  let balance = await consumptionModel.getFamilyBalance(createdFamily);
  const consumption: Consumption = {
    value: balance,
    invalidValue: 0,
    familyId: createdFamily.id as number,
    nfce: new Date().getTime().toString(),
    placeStoreId: placeStore.id as number
  };
  const cratedConsumption = await consumptionModel.addConsumption(consumption, placeStore.id as number);
  expect(cratedConsumption).toBeDefined();
  expect(cratedConsumption.id).toBeDefined();
  expect(cratedConsumption.value).toBe(balance);
  balance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(balance).toBe(0);
});

test(`[${testName}] Consume more than the balance`, async () => {
  const consumption: Consumption = {
    value: 100,
    invalidValue: 0,
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
