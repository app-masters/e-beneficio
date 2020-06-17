import moment from 'moment';
import db, { sequelize } from '../src/schemas';
import * as consumptionModel from '../src/models/consumptions';
import { Family } from '../src/schemas/families';
import { getFamilyGroupByCode } from '../src/utils/constraints';
import { Benefit } from '../src/schemas/benefits';
import { PlaceStore } from '../src/schemas/placeStores';
import { Institution } from '../src/schemas/institutions';
import { Group } from '../src/schemas/groups';

afterAll(() => {
  sequelize.close();
});

const testName = 'benefits';

const family = {
  code: '1234567890',
  groupId: getFamilyGroupByCode(1)?.id,
  responsibleName: 'ALESSANDRO MACANHA',
  responsibleBirthday: moment('01/01/1980', 'DD/MM/YYYY').toDate(),
  responsibleNis: '1234567890',
  responsibleMotherName: 'CUSTODIA SOLANGE',
  cityId: 0
} as Family;
let createdFamily: Family;

const benefit = {
  title: '[CAD25123] Auxilio municipal de teste',
  value: 500,
  date: moment().toDate(),
  institutionId: 0
} as Benefit;
const group = {
  title: 'Grupo de Testes'
} as Group;
let createdGroup: Group;
let createdBenefit: Benefit;
let placeStore: PlaceStore;
let institution: Institution;

test(`[${testName}] Create mock data`, async () => {
  [placeStore] = await db.placeStores.findAll({ limit: 1 });
  [institution] = await db.institutions.findAll({ where: { cityId: placeStore.cityId as number }, limit: 1 });

  const verifyGroup = await db.groups.findOne({ where: { title: 'Grupo de Testes' } });
  if (verifyGroup) createdGroup = verifyGroup;
  else createdGroup = await db.groups.create({ ...group });
  expect(createdGroup).toBeDefined();
  expect(createdGroup.id).toBeDefined();

  const verifyBenefit = await db.benefits.findOne({ where: { title: '[CAD25123] Auxilio municipal de teste' } });
  if (!verifyBenefit) {
    benefit.groupId = institution.id as number;
    benefit.institutionId = institution.id as number;
    createdBenefit = await db.benefits.create({ ...benefit });
    expect(createdBenefit).toBeDefined();
    expect(createdBenefit.id).toBeDefined();
    for (let i = 1; i < 11; i++) {
      await db.benefitProducts.create({
        productId: i,
        benefitId: createdBenefit.id,
        amount: 2
      });
    }
  } else createdBenefit = verifyBenefit;

  const verifyFamily = await db.families.findOne({ where: { code: '1234567890' } });
  if (verifyFamily) createdFamily = verifyFamily;
  else createdFamily = await db.families.create({ ...family, groupId: createdGroup.id, cityId: placeStore.cityId });

  expect(createdFamily).toBeDefined();
  expect(createdFamily.id).toBeDefined();
});

test(`[${testName}] Benefit on start of current month`, async () => {
  await db.benefits.update(
    { date: moment().startOf('month').toDate() },
    { where: { id: createdBenefit.id as number } }
  );
  const balance = await consumptionModel.getFamilyDependentBalanceProduct(createdFamily);
  expect(balance).toBeDefined();
  expect(balance).toBeInstanceOf(Array);
  expect(balance.length).toBeGreaterThan(0);
});

test(`[${testName}] Benefit on end of current month`, async () => {
  await db.benefits.update({ date: moment().endOf('month').toDate() }, { where: { id: createdBenefit.id as number } });
  const balance = await consumptionModel.getFamilyDependentBalanceProduct(createdFamily);
  expect(balance).toBeDefined();
  expect(balance).toBeInstanceOf(Array);
  expect(balance.length).toBe(0);
});

test(`[${testName}] Benefit on start of last month`, async () => {
  await db.benefits.update(
    { date: moment().subtract(1, 'month').startOf('month').toDate() },
    { where: { id: createdBenefit.id as number } }
  );
  const balance = await consumptionModel.getFamilyDependentBalanceProduct(createdFamily);
  expect(balance).toBeDefined();
  expect(balance).toBeInstanceOf(Array);
  expect(balance.length).toBe(0);
});

test(`[${testName}] Benefit on end of last month`, async () => {
  await db.benefits.update(
    { date: moment().subtract(1, 'month').endOf('month').toDate() },
    { where: { id: createdBenefit.id as number } }
  );
  const balance = await consumptionModel.getFamilyDependentBalanceProduct(createdFamily);
  expect(balance).toBeDefined();
  expect(balance).toBeInstanceOf(Array);
  expect(balance.length).toBe(0);
});

test(`[${testName}] Benefit on start of next month`, async () => {
  await db.benefits.update(
    { date: moment().add(1, 'month').startOf('month').toDate() },
    { where: { id: createdBenefit.id as number } }
  );
  const balance = await consumptionModel.getFamilyDependentBalanceProduct(createdFamily);
  expect(balance).toBeDefined();
  expect(balance).toBeInstanceOf(Array);
  expect(balance.length).toBe(0);
});

test(`[${testName}] Benefit on end of next month`, async () => {
  await db.benefits.update(
    { date: moment().add(1, 'month').endOf('month').toDate() },
    { where: { id: createdBenefit.id as number } }
  );
  const balance = await consumptionModel.getFamilyDependentBalanceProduct(createdFamily);
  expect(balance).toBeDefined();
  expect(balance).toBeInstanceOf(Array);
  expect(balance.length).toBe(0);
});

test(`[${testName}] Benefit on end of next month`, async () => {
  await db.benefits.update(
    { date: moment().add(1, 'month').endOf('month').toDate() },
    { where: { id: createdBenefit.id as number } }
  );
  const balance = await consumptionModel.getFamilyDependentBalanceProduct(createdFamily);
  expect(balance).toBeDefined();
  expect(balance).toBeInstanceOf(Array);
  expect(balance.length).toBe(0);
});

test(`[${testName}] Benefit on start of last year`, async () => {
  await db.benefits.update(
    { date: moment().subtract(1, 'year').startOf('year').toDate() },
    { where: { id: createdBenefit.id as number } }
  );
  const balance = await consumptionModel.getFamilyDependentBalanceProduct(createdFamily);
  expect(balance).toBeDefined();
  expect(balance).toBeInstanceOf(Array);
  expect(balance.length).toBe(0);
});

test(`[${testName}] Benefit on end of last year`, async () => {
  await db.benefits.update(
    { date: moment().subtract(1, 'year').endOf('year').toDate() },
    { where: { id: createdBenefit.id as number } }
  );
  const balance = await consumptionModel.getFamilyDependentBalanceProduct(createdFamily);
  expect(balance).toBeDefined();
  expect(balance).toBeInstanceOf(Array);
  expect(balance.length).toBe(0);
});

test(`[${testName}] Benefit on start of next year`, async () => {
  await db.benefits.update(
    { date: moment().add(1, 'year').startOf('year').toDate() },
    { where: { id: createdBenefit.id as number } }
  );
  const balance = await consumptionModel.getFamilyDependentBalanceProduct(createdFamily);
  expect(balance).toBeDefined();
  expect(balance).toBeInstanceOf(Array);
  expect(balance.length).toBe(0);
});

test(`[${testName}] Benefit on end of next year`, async () => {
  await db.benefits.update(
    { date: moment().add(1, 'year').endOf('year').toDate() },
    { where: { id: createdBenefit.id as number } }
  );
  const balance = await consumptionModel.getFamilyDependentBalanceProduct(createdFamily);
  expect(balance).toBeDefined();
  expect(balance).toBeInstanceOf(Array);
  expect(balance.length).toBe(0);
});
