import db from '../schemas';
import path from 'path';
import fs from 'fs';
import Sequelize from 'sequelize';
import csv from 'csvtojson';
import deburr from 'lodash/deburr';
import uniqBy from 'lodash/uniqBy';
import { createObjectCsvWriter } from 'csv-writer';
import { getFamilyGroupByCode } from '../utils/constraints';
import moment from 'moment';
import logging from '../utils/logging';
import { compareNames } from '../utils/string';
import { parseFamilyAndSislameItems, certifyDependentsByFamilyList } from './dependents';
import { getFamilyDependentBalance, ProductBalance } from './consumptions';

import { FamilyItem, SislameItem, OriginalSislameItem, OriginalNurseryItem } from '../typings/filesItems';
import { Family, SequelizeFamily } from '../schemas/families';
import { City } from '../schemas/cities';
import { Dependent } from '../schemas/depedents';
import { SequelizeConsumption } from '../schemas/consumptions';

type ImportReport = {
  status: 'Em espera' | 'Finalizado' | 'Falhou' | 'Lendo arquivos' | 'Filtrando dados' | 'Salvando' | 'Cruzando dados';
  message?: string;
  percentage?: number;
  cityId?: NonNullable<City['id']>;
  inProgress?: boolean;
  originalFamilyCount?: number;
  originalSislameCount?: number;
  originalNurseryCount?: number;
  filteredFamilyCount?: number;
  grantedFamilyCount?: number;
  aboveAgeFamilyCount?: number;
  aboveAgeSislameCount?: number;
  foundOnlyNameFamilyCount?: number;
  grantedAnotherParentCount?: number;
  notFoundFamilyCount?: number;
  dependentsCount?: number;
  duplicatedCount?: number;
  sislameWithoutParentCount?: number;
  fourteenOrLessGrantedCount?: number;
  fourteenOrLessFilteredCount?: number;
};

// Global report
const importReportList: ImportReport[] = [];

const csvWriterList: { [key: string]: ReturnType<typeof createObjectCsvWriter> } = {};

const type = process.env.CONSUMPTION_TYPE as 'ticket' | 'product';

/**
 * Get or create CSV Writer for the the city
 * @param cityId logged user unique ID
 * @returns CSV Writer instance
 */
export const getCSVWriter = (cityId: NonNullable<City['id']>) => {
  if (!csvWriterList[cityId]) {
    const filePath = `${path.dirname(__dirname)}/../database/storage/reason_${cityId}.csv`;
    // Create file
    fs.writeFileSync(filePath, undefined);
    // Create object csv writer - using the same writer will edit the same file
    csvWriterList[cityId] = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'UF', title: 'UF' },
        { id: 'MUNICIPIO', title: 'MUNICIPIO' },
        { id: 'TITULAR', title: 'TITULAR' },
        { id: 'DTNASCTIT', title: 'DTNASCTIT' },
        { id: 'NISTITULAR', title: 'NISTITULAR' },
        { id: 'COMPETFOLHA', title: 'COMPETFOLHA' },
        { id: 'SITFAM', title: 'SITFAM' },
        { id: 'NISDEPENDEN', title: 'NISDEPENDEN' },
        { id: 'DEPENDENTE', title: 'DEPENDENTE' },
        { id: 'IDADE', title: 'IDADE' },
        { id: 'DTNASCDEP', title: 'DTNASCDEP' },
        { id: 'QTDE. MEMBROS', title: 'QTDE. MEMBROS' },
        { id: 'reason', title: 'MOTIVO' }
      ]
    });
  }
  return csvWriterList[cityId];
};

/**
 * Remove city CSV Writer from the list
 * @param cityId logged user unique ID
 */
export const removeCSVWriter = (cityId: NonNullable<City['id']>) => {
  delete csvWriterList[cityId];
};

/**
 * Reset counts for all report data
 * @param cityId logged user city ID
 */
export const resetImportReport = (cityId: NonNullable<City['id']>) => {
  const index = importReportList.findIndex((item) => item.cityId === cityId);
  if (index > -1) {
    // Removing if already exists
    importReportList.splice(index, 1);
  }
  importReportList.push({
    status: 'Em espera',
    cityId: cityId,
    originalFamilyCount: 0,
    originalSislameCount: 0,
    originalNurseryCount: 0,
    filteredFamilyCount: 0,
    grantedFamilyCount: 0,
    aboveAgeFamilyCount: 0,
    aboveAgeSislameCount: 0,
    foundOnlyNameFamilyCount: 0,
    grantedAnotherParentCount: 0,
    notFoundFamilyCount: 0,
    dependentsCount: 0,
    duplicatedCount: 0,
    sislameWithoutParentCount: 0,
    fourteenOrLessGrantedCount: 0,
    fourteenOrLessFilteredCount: 0
  });
};

/**
 * Increase counter on the report
 * @param cityId Logged user city ID
 * @param counterKey Key of the report that will increase
 * @param numberToSum absolute value to sum on the counter (default: 1)
 */
export const addOnReportCount = (
  cityId: NonNullable<City['id']>,
  counterKey: keyof ImportReport,
  numberToSum?: number
) => {
  const index = importReportList.findIndex((item) => item.cityId === cityId);
  const item = importReportList[index];
  const value = item[counterKey];
  if (typeof value === 'number') {
    const newValue = (value || 0) + (numberToSum || 1);
    importReportList[index] = {
      ...item,
      [counterKey]: newValue
    };
  }
};

/**
 * Get current report for the city
 * @param cityId logged user city unique ID
 * @returns ImportReport
 */
export const getImportReport = (cityId: NonNullable<City['id']>): ImportReport => {
  const importReport = importReportList.find((item) => item.cityId === cityId);
  if (!importReport) return { status: 'Em espera', cityId, inProgress: false };
  return importReport;
};

/**
 * Update current report for the city
 * @param importReport new import report data
 * @param cityId logged user city unique ID
 */
export const updateImportReport = (importReport: ImportReport, cityId: NonNullable<City['id']>) => {
  const index = importReportList.findIndex((item) => item.cityId === cityId);
  let newImportReport: ImportReport = { cityId, status: importReport.status };
  if (index > -1) {
    // Removing if already exists
    newImportReport = importReportList[index];
    importReportList.splice(index, 1);
  }
  // Default status progress is true
  const inProgress = importReport.inProgress !== undefined ? importReport.inProgress : true;
  const message = importReport.message ? importReport.message : undefined;
  // Update object and list
  newImportReport = { ...newImportReport, ...importReport, cityId, inProgress, message };
  importReportList.push(newImportReport);
};

/**
 * Get all items on the table without any filter
 */
export const getAll = async (): Promise<SequelizeFamily[]> => {
  return await db.families.findAll({ include: [{ model: db.dependents, as: 'dependents' }] });
};

/**
 * Get all items on the table with filter
 * @param nis searched nis code
 * @param cityId logged user city ID`
 * @param populateDependents should the dependents be returned?
 * @param populateSchool should the school be returned?
 * @returns Promise<List of items>
 */
export const findByNis = async (
  nis: NonNullable<Family['responsibleNis']>,
  cityId: NonNullable<City['id']>,
  populateDependents?: boolean,
  populateSchool?: boolean
): Promise<SequelizeFamily & { school?: Dependent['schoolName'] }> => {
  const [family] = await db.families.findAll({
    where: { responsibleNis: nis, cityId },
    limit: 1,
    include: !populateDependents && !populateSchool ? [] : [{ model: db.dependents, as: 'dependents' }]
  });
  if (family && populateSchool && family.dependents) {
    const yongerDepedent = family.dependents.sort((a, b) => moment(b.birthday).diff(moment(a.birthday)))[0];
    family.setDataValue('dependents', undefined);
    family.setDataValue('school' as 'id', yongerDepedent.schoolName);
  }
  return family;
};

/**
 * Get all items on the table with filter
 * @param code searched family code
 * @param cityId logged user city ID
 * @returns Promise<List of items>
 */
export const findByCode = async (
  code: NonNullable<Family['code']>,
  cityId: NonNullable<City['id']>
): Promise<SequelizeFamily & { school?: Dependent['schoolName'] }> => {
  const [family] = await db.families.findAll({
    where: { code: code, cityId },
    limit: 1,
    include: [{ model: db.dependents, as: 'dependents' }]
  });

  if (family && family.dependents) {
    const responsible = family.dependents?.find((f) => f.isResponsible);
    if (!responsible) return family;
    else family.dependents = [responsible];
  } else {
    throw { status: 409, message: 'Familia não encontrada.' };
  }
  return family;
};

/**
 * Get all items on the table with filter
 * @param id searched family id
 * @param cityId logged user city ID
 * @returns Promise<List of items>
 */
export const findById = async (
  id: NonNullable<Family['id']>,
  cityId: NonNullable<City['id']>
): Promise<SequelizeFamily & { school?: Dependent['schoolName'] }> => {
  const [family] = await db.families.findAll({
    where: { id, cityId },
    limit: 1,
    include: [{ model: db.dependents, as: 'dependents' }]
  });

  if (family && family.dependents) {
    const responsible = family.dependents?.find((f) => f.isResponsible);
    if (!responsible) return family;
    else family.dependents = [responsible];
  } else {
    throw { status: 409, message: 'Familia não encontrada.' };
  }
  return family;
};

/**
 * Get all items by the place store id
 * @param placeStoreId searched place store id
 * @param cityId logged user city ID`
 * @param populateDependents should the dependents be returned?
 * @param calculateBalance should family balance be calculated?
 * @returns Promise<List of items>
 */
export const findByPlaceStore = async (
  placeStoreId: NonNullable<Family['placeStoreId']>,
  cityId: NonNullable<City['id']>,
  populateDependents?: boolean,
  calculateBalance?: boolean
): Promise<(Family & { balance?: number | ProductBalance })[]> => {
  const families: (SequelizeFamily & { balance?: number | ProductBalance })[] = await db.families.findAll({
    where: { placeStoreId, cityId },
    include: populateDependents ? [{ model: db.dependents, as: 'dependents' }] : undefined,
    order: [[{ model: db.dependents, as: 'dependents' }, 'isResponsible', 'desc']]
  });

  const list = await Promise.all(
    families.map(async (family) => ({
      ...(family.toJSON() as Family),
      balance: calculateBalance ? await getFamilyDependentBalance(family) : undefined
    }))
  );

  return list;
};

type CSVReport = {
  created: number;
  updated: number;
  deleted: number;
  wrong: number;
  report: string[];
  finished: boolean;
};

/**
 * Create or update family by Family Code
 * @param family Family Object
 */
export const certifyFamilyByCode = async (family: Family) => {
  const [createdFamily, created] = await db.families.findCreateFind({ where: { code: family.code }, defaults: family });
  if (!created) {
    // Just update the family with the new data
    const [, [item]] = await db.families.update(family, { where: { id: createdFamily.id as number }, returning: true });
    return item;
  } else {
    // Family was created
    return createdFamily;
  }
};

/**
 * Create or update family by Responsible NIS
 * @param family Family Object
 */
export const certifyFamilyByNis = async (family: Family) => {
  if (!family.responsibleNis) throw { status: 412, message: 'Familia sem NIS de responsável' };
  const [createdFamily, created] = await db.families.findCreateFind({
    where: { responsibleNis: family.responsibleNis },
    defaults: family
  });
  if (!created) {
    // Just update the family with the new data
    const [, [item]] = await db.families.update(family, { where: { id: createdFamily.id as number }, returning: true });
    return item;
  } else {
    // Family was created
    return createdFamily;
  }
};

/**
 * Create or update family by Responsible NIS
 * @param family Family Object
 */
export const certifyFamilyAndDependents = async (family: Family) => {
  const dbFamily = await certifyFamilyByNis(family);
  dbFamily.dependents = await certifyDependentsByFamilyList(dbFamily.id as number, family.dependents || []);
  return dbFamily;
};

/**
 * Import CSV file to create/update/delete families using the file values
 * @param path CSV file path
 * @param cityId logged user city ID
 * @param deleteOthers delete all non created/updated items on the DB
 */
export const importFamilyFromCSVFile = async (
  path: string,
  cityId: NonNullable<City['id']>,
  deleteOthers?: boolean
): Promise<CSVReport> => {
  const reportResult: CSVReport = { created: 0, updated: 0, deleted: 0, wrong: 0, report: [], finished: false };
  const timeStart = new Date().getTime();
  let promises: Promise<any>[] = [];
  const conversion: Promise<CSVReport> = new Promise((resolve, reject) => {
    csv({ delimiter: ';' })
      .fromFile(path)
      .subscribe(
        (json, lineNumber) => {
          /**
           * Handler for a single line of the CSV file
           */
          const lineHandler = async () => {
            try {
              const timeStartLine = new Date().getTime();
              if (json['cod_parentesco_rf_pessoa'] !== '1') {
                // We're only saving people that are the responsible for the family (RF)
                reportResult.wrong++;
                reportResult.report.push(`[linha: ${lineNumber}] Pessoa ${json['nom_pessoa']} não é um RF`);
                return;
              }
              const group = getFamilyGroupByCode(json.d['fx_rfpc']);
              if (!group) {
                reportResult.wrong++;
                reportResult.report.push(
                  `[linha: ${lineNumber}] Família ${json['cod_familiar_fam']} está com um valor inválido de fx_rfpc`
                );
                return;
              }
              // Converting CSV format to DB format
              const family = {
                code: json.d['cod_familiar_fam'],
                groupId: group.id,
                responsibleName: json['nom_pessoa'],
                responsibleBirthday: moment(json['dta_nasc_pessoa'], 'DD/MM/YYYY').toDate(),
                responsibleNis: json['num_nis_pessoa_atual'],
                responsibleMotherName: json['nom_completo_mae_pessoa'],
                cityId
              };
              // Checking if a family is already created using the same family code and create if don't
              promises.push(certifyFamilyByCode(family));
              reportResult.updated++;

              // Executing promises
              if (promises.length >= 100) {
                await Promise.all(promises);
                promises = [];
              }
              const timeEnd = new Date().getTime();
              process.stdout.write(
                `[line: ${lineNumber}] ------------------------------------ time spent: ${
                  timeEnd - timeStartLine
                }ms - mean: ${((timeEnd - timeStart) / (lineNumber + 1)).toFixed(2)}ms - total: ${
                  timeEnd - timeStart
                }ms         ` + '\r'
              );
            } catch (error) {
              reportResult.wrong++;
              reportResult.report.push(`[linha: ${lineNumber}] Erro inesperado: ${error.message}`);
              logging.error(error);
            }
          };

          return lineHandler();
        },
        (error: Error): void => {
          reject(error);
          logging.error(error);
        },
        async () => {
          if (promises.length > 0) {
            await Promise.all(promises);
          }
          console.log(``);
          console.log(`FINAL TIME: ${new Date().getTime() - timeStart}ms`);
          reportResult.finished = true;
          resolve(reportResult);
        }
      );
  });

  // Delete rows
  if (deleteOthers) {
    // ...
  }

  return conversion;
};

/**
 * Get family dashboard object
 * @param cityId logged user city ID
 */
export const getDashboardInfo = async (cityId: NonNullable<City['id']>) => {
  const currentMonth = moment().month();

  const dashboard: { [key: string]: number | Date } = { total: 0 };

  const families = await db.families.findAll({
    where: { cityId }
  });

  dashboard.familyCount = families.filter((f) => !f.deactivatedAt).length;
  dashboard.familyDeactivatedCount = families.filter((f) => f.deactivatedAt).length;

  dashboard.familyDeactivatedMonthCount = families.filter(
    (f) => f.deactivatedAt && moment(f.deactivatedAt as Date).month() === currentMonth
  ).length;
  dashboard.familyCreatedMonthCount = families.filter(
    (f) => moment(f.createdAt as Date).month() === currentMonth
  ).length;

  const dependents = await db.dependents.findAll({
    include: [{ model: db.families, as: 'family', where: { deactivatedAt: null, cityId } }]
  });

  dashboard.dependentCreatedMonthCount = dependents.filter(
    (f) => !f.deactivatedAt && moment(f.createdAt as Date).month() === currentMonth
  ).length;

  dashboard.dependentCount = dependents.filter((f) => !f.deactivatedAt).length;

  const last = await db.families.max<SequelizeFamily, SequelizeFamily['createdAt']>('createdAt');
  if (last) {
    dashboard.lastCreatedDate = moment(last).toDate();
  }

  return dashboard;
};

/**
 * Function to create a new row on the table
 *
 * @param values object with the new item data
 * @param cityId current city of user
 * @returns Promise<Item>
 */
export const createFamilyWithDependents = async (
  values: Family | SequelizeFamily,
  cityId: string | number
): Promise<SequelizeFamily> => {
  //verify if dependent exist
  if (type === 'product') {
    if (values.dependents) {
      const verifyResponsible = values.dependents?.filter((f) => f.isResponsible);
      if (verifyResponsible.length > 1)
        throw { status: 412, message: 'Somente um membro responsável por familia é permitido.' };
      if (verifyResponsible.length === 0)
        throw { status: 412, message: 'É necessário um membro responsável por familia.' };

      const dependentRg = values.dependents?.map((dep) => {
        return dep.rg as string;
      });
      const dependentCpf = values.dependents?.map((dep) => {
        return dep.cpf as string;
      });
      const dependents = await db.dependents.findAll({
        where: Sequelize.or(
          // { nis: { [Sequelize.Op.in]: dependentNis } },
          { rg: { [Sequelize.Op.in]: dependentRg } },
          { cpf: { [Sequelize.Op.in]: dependentCpf } }
        )
      });
      if (dependents.length > 0) {
        const listOfNames = dependents.map((dep) => {
          return dep.name;
        });
        throw {
          status: 412,
          message: `Dependente${listOfNames.length > 1 ? 's' : ''} ${listOfNames.toString()} já cadastrado${
            listOfNames.length > 1 ? 's' : ''
          }.`
        };
      }
    } else {
      throw { status: 412, message: 'É necessário no mínimo um membro por familia.' };
    }
  }

  return db.families.create({ ...values, cityId }).then(async (family) => {
    if (values.dependents) {
      const depedentsList = values.dependents?.map((dep) => {
        dep.familyId = family.id as number;
        return dep;
      });
      if (depedentsList && depedentsList?.length > 0) {
        family.dependents = await db.dependents.bulkCreate(depedentsList as Dependent[]);
      }
    }
    return family;
  });
};

/**
 * Function to create a new row on the table
 * @param values object with the new item data
 * @returns Promise<Item>
 */
export const create = (values: Family | SequelizeFamily): Promise<SequelizeFamily> => {
  return db.families.create(values);
};

/**
 * Function to update a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @param values object with the new data
 * @returns Promise<Item>
 */
export const updateById = async (
  id: NonNullable<Family['id']>,
  values: Family | SequelizeFamily
): Promise<SequelizeFamily | null> => {
  // Trying to get item on the city
  const cityItem = await db.families.findByPk(id);
  if (cityItem) {
    // The update return an array [count, item[]], so I'm destructuring to get the updated benefit
    await db.families.update(values, { where: { id } });

    if (type === 'product') {
      if (values.dependents) {
        const verifyResponsible = values.dependents?.filter((f) => f.isResponsible);
        if (verifyResponsible.length > 1)
          throw { status: 412, message: 'Somente um membro responsável por familia é permitido.' };
        if (verifyResponsible.length === 0)
          throw { status: 412, message: 'É necessário um membro responsável por familia.' };

        const depIds = values.dependents.map((dep: Dependent) => {
          return dep.id;
        });
        const familyDependents = await db.dependents.findAll({ where: { familyId: values.id as number } });
        const dependentsToAdd = values.dependents
          .filter((f) => !f.id)
          .map((dep) => {
            return { ...dep, familyId: values.id };
          });
        const dependentsToUpdate = values.dependents.filter((f) => f.id);
        const dependentsToRemove = familyDependents.filter((f) => !depIds.includes(f.id));

        await db.dependents.bulkCreate(dependentsToAdd);

        dependentsToUpdate.map(async (up) => {
          if (up.id) await db.dependents.update({ ...up }, { where: { id: up.id } });
        });

        dependentsToRemove.map(async (dt) => {
          if (dt.id) await db.dependents.destroy({ where: { id: dt.id } });
        });
      } else {
        throw { status: 412, message: 'É necessário no mínimo um membro por familia.' };
      }
    }

    return await db.families.findOne({
      where: { id: values.id as number },
      include: [{ model: db.dependents, as: 'dependents', where: { familyId: values.id as number } }]
    });
  }
  return null;
};

/**
 * Function to deactivate a row on the table by the unique ID
 * @param id unique ID of the desired item
 * @returns Promise<Item>
 */
export const deactivateFamilyAndDependentsById = async (
  id: NonNullable<Family['id']>
): Promise<SequelizeFamily | null> => {
  // Trying to get item on the city
  const cityItem: (SequelizeFamily & { balance?: number | ProductBalance }) | null = await db.families.findByPk(id, {
    include: [{ model: db.dependents, as: 'dependents' }]
  });
  if (cityItem) {
    // If it have dependents, deactvate all of then
    if (cityItem.dependents) {
      await Promise.all(
        cityItem.dependents.map((dependent) =>
          db.dependents.update({ deactivatedAt: moment().toDate() }, { where: { id: dependent.id || 0 } })
        )
      );
    }
    await db.families.update({ deactivatedAt: moment().toDate() }, { where: { id } });

    cityItem.reload({ include: [{ model: db.dependents, as: 'dependents' }] });
    cityItem.balance = await getFamilyDependentBalance(cityItem);

    return cityItem;
  }
  return null;
};

// Official Sislame file
const keys = {
  dependentName: 'NOME DO ALUNO',
  birthday: 'Data Nascimento',
  motherName: 'Nome Mae',
  originalMotherName: 'Nome Mãe',
  fatherName: 'Nome Pai',
  originalFatherName: 'Nome Pai',
  responsibleName: 'Nome Responsavel',
  originalResponsibleName: 'Nome Responsável',
  schoolName: 'NOME ESCOLA',
  uniqueNumber: 'ID_ALUNO_MATRICULA',
  phone: 'Telefone',
  phone2: 'Telefone Celular',
  zip: 'CEP',
  district: 'Bairro',
  originalNumber: 'Número',
  number: 'Numero',
  street: 'Logradouro',
  complement: 'Complemento'
};

/**
 * Convert CSV family to DB family
 * @param family CSV family
 * @param cityId logged user city unique ID
 * @param extra address optional data
 * @returns DB family
 */
export const parseFamilyItem = (
  family: FamilyItem,
  cityId: NonNullable<City['id']>,
  extra?: { phone?: string; phone2?: string; address?: string }
): Family => {
  return {
    responsibleNis: family['NISTITULAR'],
    responsibleName: family['TITULAR'],
    responsibleBirthday: moment(family['DTNASCTIT'], 'DD/MM/YYYY').toDate(),
    responsibleMotherName: '',
    code: '',
    groupId: getFamilyGroupByCode(0).id,
    cityId,
    phone: extra?.phone,
    phone2: extra?.phone2,
    address: extra?.address
  };
};

/**
 * Check item and throw error if required key is not found
 * @param item single sislame item
 * @param cityId logged user city unique ID
 */
export const checkRequiredSislameData = (item: OriginalSislameItem, cityId: NonNullable<City['id']>): void => {
  if (!item) throw { status: 412, message: 'Nenhum dado na tabela do Sislame' };
  const requiredKeys = [keys.dependentName, keys.responsibleName] as (keyof OriginalSislameItem)[]; // Checking before removing the special characters
  const availableKeys = Object.keys(item).map(deburr) as (keyof OriginalSislameItem)[];
  const notFoundKeys = requiredKeys.filter((key) => availableKeys.indexOf(key) < 0);
  if (notFoundKeys && notFoundKeys.length > 0) {
    const message = `Na tabela do Sislame, as seguintes colunas não foram encontradas: ${notFoundKeys.join(', ')}`;
    updateImportReport({ status: 'Falhou', message, inProgress: false }, cityId);
    throw { status: 412, message };
  }
};

/**
 * Check item and throw error if required key is not found
 * @param item single family item
 * @param cityId logged user city unique ID
 */
export const checkRequiredFamilyData = (item: FamilyItem, cityId: NonNullable<City['id']>): void => {
  if (!item) throw { status: 412, message: 'Nenhum dado na tabela do Bolsa Família' };
  const requiredKeys = [
    'DEPENDENTE',
    'NISDEPENDEN',
    'NISTITULAR',
    'TITULAR',
    'DTNASCTIT',
    'DTNASCDEP'
  ] as (keyof FamilyItem)[]; // Checking before removing the special characters
  const availableKeys = Object.keys(item) as (keyof FamilyItem)[];
  const notFoundKeys = requiredKeys.filter((key) => availableKeys.indexOf(key) < 0);
  if (notFoundKeys && notFoundKeys.length > 0) {
    const message = `Na tabela do Bolsa Família, as seguintes colunas não foram encontradas: ${notFoundKeys.join(
      ', '
    )} --- Disponíveis: ${availableKeys.join(', ')}`;
    updateImportReport({ status: 'Falhou', message, inProgress: false }, cityId);
    throw { status: 412, message };
  }
};

/**
 * Check item and throw error if required key is not found
 * @param item single nursery item
 * @param cityId logged user city unique ID
 */
export const checkRequiredNurseryData = (item: OriginalNurseryItem, cityId: NonNullable<City['id']>): void => {
  if (!item) throw { status: 412, message: 'Nenhum dado na tabela do Bolsa Família' };
  const requiredKeys = ['Criança', 'Creche', 'RESPONSAVEL'] as (keyof OriginalNurseryItem)[]; // Checking before removing the special characters
  const availableKeys = Object.keys(item) as (keyof OriginalNurseryItem)[];
  const notFoundKeys = requiredKeys.filter((key) => availableKeys.indexOf(key) < 0);
  if (notFoundKeys && notFoundKeys.length > 0) {
    const message = `Na tabela das Creches, as seguintes colunas não foram encontradas: ${notFoundKeys.join(
      ', '
    )} --- Disponíveis: ${availableKeys.join(', ')}`;
    updateImportReport({ status: 'Falhou', message, inProgress: false }, cityId);
    throw { status: 412, message };
  }
};

/**
 * Find the interception between CAD and Sislame data to create the families
 * @param familyFilePath file absolute path
 * @param sislameFilePath file absolute path
 * @param nurseryFilePath file absolute path
 * @param cityId logged user city ID
 */
export const importFamilyFromCadAndSislameCSV = async (
  familyFilePath: string,
  sislameFilePath: string,
  nurseryFilePath: string,
  cityId: NonNullable<City['id']>
) => {
  resetImportReport(cityId);
  // Get CSV writer to update reson file
  const CSVWriter = getCSVWriter(cityId);
  // Update report status
  updateImportReport({ status: 'Lendo arquivos' }, cityId);
  // Lendo arquivos to get the data
  let originalFamilyData: FamilyItem[] = await csv({ delimiter: ';', flatKeys: true }).fromFile(familyFilePath);
  let originalSislameData: OriginalSislameItem[] = await csv({ flatKeys: true }).fromFile(sislameFilePath);
  const originalNurseryData: OriginalNurseryItem[] = await csv({ flatKeys: true }).fromFile(nurseryFilePath);

  addOnReportCount(cityId, 'originalFamilyCount', originalFamilyData.length);
  addOnReportCount(cityId, 'originalSislameCount', originalSislameData.length);
  addOnReportCount(cityId, 'originalNurseryCount', originalNurseryData.length);

  // Update report status
  updateImportReport({ status: 'Filtrando dados' }, cityId);

  // Check all important fields
  checkRequiredSislameData(originalSislameData[0], cityId);
  checkRequiredFamilyData(originalFamilyData[0], cityId);
  checkRequiredNurseryData(originalNurseryData[0], cityId);

  // Mergeing Sislame with Nursery files
  originalSislameData = [
    ...originalSislameData,
    ...originalNurseryData.map(
      (item, index) =>
        ({
          [keys.dependentName]: item['Criança'],
          [keys.originalResponsibleName]: item['RESPONSAVEL'],
          [keys.schoolName]: item['Creche'],
          [keys.uniqueNumber]: `nursery-${index}`,
          [keys.phone]: item['TELEFONE 1'],
          [keys.phone2]: item['TELEFONE 2'],
          [keys.district]: item['BAIRRO'],
          [keys.street]: item['ENDERECO']
        } as OriginalSislameItem)
    )
  ];

  // Removing duplicated lines in each list
  const countFamilyBefore = originalFamilyData.length;
  originalFamilyData = uniqBy(originalFamilyData, (item) => `${item.NISTITULAR}-${item.NISDEPENDEN}`);

  addOnReportCount(cityId, 'duplicatedCount', countFamilyBefore - originalFamilyData.length);

  // Filtrando dados: The reduce will create two arrays, one with the valid data and one with the invalid
  // let removedFamilies: FamilyItem[] = [];
  // [originalFamilyData, removedFamilies] = originalFamilyData.reduce(
  //   ([valid, invalid], item) => {
  //     // Checking the birthday, the dependent can't have more than 17 years
  //     const validAge = moment().startOf('month').diff(moment(item['DTNASCDEP'], 'DD/MM/YYYY'), 'years') < 18;
  //     if (!validAge) {
  //       // Add to invalid data
  //       return [valid, [...invalid, { ...item, reason: 'Depedente maior de idade' }]];
  //     }
  //     // Add to valid data
  //     return [[...valid, item], invalid];
  //   },
  //   [[], []] as FamilyItem[][]
  // );
  // // Loging invalid data
  // await CSVWriter.writeRecords(removedFamilies);
  // addOnReportCount(cityId, 'aboveAgeFamilyCount', removedFamilies.length);

  // Removing special characters
  const familyData: FamilyItem[] = JSON.parse(deburr(JSON.stringify(originalFamilyData)));
  const sislameData: SislameItem[] = JSON.parse(deburr(JSON.stringify(originalSislameData)));

  addOnReportCount(cityId, 'filteredFamilyCount', familyData.length);

  const grantedFamilies: Family[] = [];

  // Going through each family in the list
  for (const familyIndex in familyData) {
    updateImportReport({ status: 'Cruzando dados', percentage: (Number(familyIndex) + 1) / familyData.length }, cityId);
    process.stdout.write(
      `[import] Famílias comparadas: ${familyIndex}/${familyData.length} (${(
        (100 * Number(familyIndex)) /
        familyData.length
      ).toFixed(2)}%) --- Encontradas: ${grantedFamilies.length}` + '\r'
    );
    const familyItem = familyData[familyIndex];
    // Finding family child on sislame
    const sislameIndex = sislameData.findIndex((sislameItem) => {
      const sameName = compareNames(sislameItem[keys.dependentName], familyItem['DEPENDENTE']);
      if (sameName) {
        // On sislame, check birthday
        if (sislameItem[keys.birthday]) {
          const sameAge =
            moment(sislameItem[keys.birthday], 'YYYY-MM-DD').diff(
              moment(familyItem['DTNASCDEP'], 'DD/MM/YYYY'),
              'days'
            ) === 0;
          if (sameAge) return true;
        }
        // On nursery or not the same age, check the parent
        const sameResponsible =
          compareNames(sislameItem[keys.motherName], familyItem['TITULAR'], true) ||
          compareNames(sislameItem[keys.fatherName], familyItem['TITULAR'], true) ||
          compareNames(sislameItem[keys.responsibleName], familyItem['TITULAR'], true);
        return sameResponsible;
      }
      return false;
    });
    // Counting if the age is bellow 14
    const fourteenOrLess = moment().startOf('month').diff(moment(familyItem.DTNASCDEP, 'DD/MM/YYYY'), 'years') < 15;
    if (sislameIndex > -1) {
      // Item was found in both databases - check if it's already on the list
      const alreadyOnListIndex = grantedFamilies.findIndex(
        (family) => family.responsibleNis === familyItem['NISTITULAR']
      );
      const dependent = parseFamilyAndSislameItems(originalFamilyData[familyIndex], originalSislameData[sislameIndex]);
      if (alreadyOnListIndex < 0) {
        // Not on the list yet, add it
        const extraData = {
          phone: originalSislameData[sislameIndex]['Telefone'],
          phone2: originalSislameData[sislameIndex]['Telefone Celular'],
          address: ['Logradouro', 'Número', 'Complemento', 'Bairro', 'CEP']
            .map((key) => originalSislameData[sislameIndex][key])
            .join(' ')
            .replace(/\#/g, '')
        };
        grantedFamilies.push({
          ...parseFamilyItem(originalFamilyData[familyIndex], cityId, extraData),
          dependents: [dependent]
        });
        addOnReportCount(cityId, 'grantedFamilyCount');
      } else {
        // Already on the list, just update the number of children
        const family = grantedFamilies[alreadyOnListIndex];
        grantedFamilies[alreadyOnListIndex] = { ...family, dependents: [...(family.dependents || []), dependent] };
      }
      addOnReportCount(cityId, 'dependentsCount');
      if (fourteenOrLess) {
        addOnReportCount(cityId, 'fourteenOrLessGrantedCount');
      }
      continue;
    }
    // Item not found in sislame database, trying to find a better reason
    const sislameItem = sislameData.find((sislameItem) => {
      return compareNames(sislameItem[keys.dependentName], familyItem['DEPENDENTE']);
    });
    if (sislameItem) {
      await CSVWriter.writeRecords([
        {
          ...familyItem,
          reason:
            'Encontrado aluno com mesmo nome no Sislame, mas responsável diferente. Atualizar Sislame ou é um homônimo'
        }
      ]);
      addOnReportCount(cityId, 'foundOnlyNameFamilyCount');
    } else {
      await CSVWriter.writeRecords([{ ...familyItem, reason: 'Dependente não está no Sislame' }]);
      addOnReportCount(cityId, 'notFoundFamilyCount');
    }
    if (fourteenOrLess) {
      addOnReportCount(cityId, 'fourteenOrLessFilteredCount');
    }
  }

  console.log('');

  // Saving families on the DB
  try {
    const dbFamiliesIds: NonNullable<Family['id']>[] = [];
    for (const index in grantedFamilies) {
      process.stdout.write(
        `[import] Famílias salvas: ${index}/${grantedFamilies.length} (${(
          (100 * Number(index)) /
          grantedFamilies.length
        ).toFixed(2)}%)` + '\r'
      );
      updateImportReport({ status: 'Salvando', percentage: (Number(index) + 1) / grantedFamilies.length }, cityId);
      // Certify family + dependent list
      const family = grantedFamilies[index];
      const dbFamily = await certifyFamilyAndDependents(family);
      dbFamiliesIds.push(dbFamily.id as number);
    }
    removeCSVWriter(cityId);
    updateImportReport({ status: 'Finalizado', inProgress: false }, cityId);
    // Deactivate all families that are not on the list
    await db.families.update(
      { deactivatedAt: moment().toDate() },
      { where: { id: { [Sequelize.Op.notIn]: dbFamiliesIds }, deactivatedAt: null } }
    );
    await db.dependents.update(
      { deactivatedAt: moment().toDate() },
      {
        where: { familyId: { [Sequelize.Op.notIn]: dbFamiliesIds }, deactivatedAt: null }
      }
    );
  } catch (error) {
    // Something failed, update the report and throw error
    removeCSVWriter(cityId);
    updateImportReport({ status: 'Falhou', message: error.message, inProgress: false }, cityId);
    throw error;
  }
  console.log('');
  console.log('[import] Finalizado');
};

/**
 * Generate CSV file with all registered families
 * @param cityId logged user unique ID
 */
export const generateListFile = async (cityId: NonNullable<City['id']>) => {
  const families = await db.families.findAll({
    where: { cityId, deactivatedAt: null },
    include: [{ model: db.dependents, as: 'dependents', required: true, where: { deactivatedAt: null } }]
  });

  const filePath = `${path.dirname(__dirname)}/../database/storage/list_${cityId}.csv`;
  // Create file
  fs.writeFileSync(filePath, undefined);
  const csvFileWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'school', title: 'ESCOLA' },
      { id: 'responsibleName', title: 'TITULAR' },
      { id: 'responsibleNis', title: 'NISTITULAR' },
      { id: 'address', title: 'ENDEREÇO' },
      { id: 'phone', title: 'TELEFONE' },
      { id: 'phone2', title: 'TELEFONE 2' },
      { id: 'dependents', title: 'DEPENDENTES' },
      { id: 'balance', title: 'SALDO' }
    ]
  });
  const benefits = await db.benefits.findAll({
    include: [{ model: db.institutions, as: 'institution', where: { cityId } }]
  });
  // Getting each family balance and adding it to the file
  let fileFamilies = [];
  for (const family of families) {
    if (!family.dependents || family.dependents.length < 1) continue;
    const balance = await getFamilyDependentBalance(family, benefits);
    const yongerDepedent = family.dependents.sort((a, b) => moment(b.birthday).diff(moment(a.birthday)))[0];
    fileFamilies.push({
      responsibleName: family.responsibleName,
      responsibleNis: family.responsibleNis,
      phone: family.phone,
      phone2: family.phone2,
      address: family.address,
      balance,
      dependents: family.dependents.length,
      school: yongerDepedent.schoolName
    });
  }
  // Sort File
  fileFamilies = fileFamilies.sort((a, b) => {
    const schoolCompare = a.school?.localeCompare(b.school || '') || 0;
    if (schoolCompare === 0) {
      return a.responsibleName?.localeCompare(b.responsibleName || '') || 0;
    }
    return schoolCompare;
  });
  await csvFileWriter.writeRecords(fileFamilies);
  return path.resolve(filePath);
};

/**
 * List family consumptions
 * @param id FamilyId
 */
export const getFamilyConsumption = async (id: number | string): Promise<SequelizeConsumption[]> => {
  const family = await db.families.findOne({ where: { id } });
  if (!family) {
    throw { status: 412, message: 'Família não encontrada.' };
  }
  // Get all consumptions already made
  const consumption = await db.consumptions.findAll({
    where: { familyId: family.id as number },
    include: [
      { model: db.consumptionProducts, as: 'consumptionProducts', include: [{ model: db.products, as: 'product' }] }
    ]
  });
  return consumption;
};
