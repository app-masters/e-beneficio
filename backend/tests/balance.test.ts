import moment from 'moment';
import db, { sequelize } from '../src/schemas';
import * as consumptionModel from '../src/models/consumptions';
import { Family } from '../src/schemas/families';
import { getFamilyGroupByCode } from '../src/utils/constraints';
import { Benefit } from '../src/schemas/benefits';
import { PlaceStore } from '../src/schemas/placeStores';
import { Institution } from '../src/schemas/institutions';

afterAll(() => {
  sequelize.close();
});

const testName = 'balance';

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
let institution: Institution;

test(`[${testName}] Create mock data`, async () => {
  [placeStore] = await db.placeStores.findAll({ limit: 1 });
  [institution] = await db.institutions.findAll({ where: { cityId: placeStore.cityId as number }, limit: 1 });
  benefit.institutionId = institution.id as number;
  createdFamily = await db.families.create({ ...family, cityId: placeStore.cityId });
  expect(createdFamily).toBeDefined();
  expect(createdFamily.id).toBeDefined();
  createdBenefit = await db.benefits.create({ ...benefit });
  expect(createdBenefit).toBeDefined();
  expect(createdBenefit.id).toBeDefined();
});

test(`[${testName}] Get family balance`, async () => {
  const balance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(balance).toBeGreaterThanOrEqual(benefit.value);
});

test(`[${testName}] Test correct benefit`, async () => {
  const balance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(balance).toBeGreaterThanOrEqual(benefit.value);
  const date = moment();
  await db.benefits.create({
    ...benefit,
    month: date.month() + 1,
    year: date.year()
  });
  const newBalance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(newBalance).toBe(balance + benefit.value);
});

test(`[${testName}] Test last month benefit`, async () => {
  const balance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(balance).toBeGreaterThanOrEqual(benefit.value);
  const date = moment().add(-1, 'month').startOf('month');
  await db.benefits.create({
    ...benefit,
    month: date.month() + 1,
    year: date.year()
  });
  const newBalance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(newBalance).toBe(balance);
});

test(`[${testName}] Test last year benefit`, async () => {
  const balance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(balance).toBeGreaterThanOrEqual(benefit.value);
  const date = moment().add(-1, 'year').startOf('month');
  await db.benefits.create({
    ...benefit,
    month: date.month() + 1,
    year: date.year()
  });
  const newBalance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(newBalance).toBe(balance);
});

test(`[${testName}] Test next month benefit`, async () => {
  const balance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(balance).toBeGreaterThanOrEqual(benefit.value);
  const date = moment().add(1, 'month').startOf('month');
  await db.benefits.create({
    ...benefit,
    month: date.month() + 1,
    year: date.year()
  });
  const newBalance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(newBalance).toBe(balance);
});

test(`[${testName}] Test next year benefit`, async () => {
  const balance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(balance).toBeGreaterThanOrEqual(benefit.value);
  const date = moment().add(1, 'year');
  await db.benefits.create({
    ...benefit,
    month: date.month() + 1,
    year: date.year()
  });
  const newBalance = await consumptionModel.getFamilyBalance(createdFamily);
  expect(newBalance).toBe(balance);
});
