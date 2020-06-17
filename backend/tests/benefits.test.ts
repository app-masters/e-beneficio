import moment from 'moment';
import db, { sequelize } from '../src/schemas';
import * as consumptionModel from '../src/models/consumptions';
// import { Family } from '../src/schemas/families';
import { getFamilyGroupByCode } from '../src/utils/constraints';
import { Benefit } from '../src/schemas/benefits';

afterAll(() => {
  sequelize.close();
});

const testName = 'benefits';

const benefit = {
  institutionId: 1,
  groupId: 1,
  title: 'BenefitTest 1',
  date: moment('05/05/2020', 'DD/MM/YYYY').toDate()
} as Benefit;
let createdBenefit: Benefit | null;

const family = {
  code: Math.floor(Math.random() * 10000000).toString(),
  groupId: getFamilyGroupByCode(1)?.id,
  responsibleName: 'Family After',
  responsibleBirthday: moment('01/01/1980', 'DD/MM/YYYY').toDate(),
  responsibleNis: Math.floor(Math.random() * 10000000000).toString(),
  responsibleMotherName: '',
  createdAt: moment('05/06/2020', 'DD/MM/YYYY').toDate(),
  cityId: 0
};

test(`[${testName}] Create mock data`, async () => {
  createdBenefit = await db.benefits.findOne({ where: { title: benefit.title } });
  if (!createdBenefit) createdBenefit = await db.benefits.create({ ...benefit, institutionId: 1 });
  expect(createdBenefit).toBeDefined();
  expect(createdBenefit.id).toBeDefined();
});

test(`[${testName}] Get family before benefit`, async () => {
  try {
    family.createdAt = moment('03/03/2020', 'DD/MM/YYYY').toDate();
    await consumptionModel.getFamilyDependentBalance(family);
  } catch (e) {
    expect(e.message).toBe('Nenhum benefício disponível');
  }
});

test(`[${testName}] Get family after benefit`, async () => {
  const [, [family]] = await db.families.update(
    { createdAt: moment('09/09/2020', 'DD/MM/YYYY').toDate() },
    { where: { responsibleNis: '1234' }, returning: true }
  );
  let balance;
  if (family) balance = await consumptionModel.getFamilyDependentBalance(family);
  expect(balance).toBeInstanceOf(Array);
});
