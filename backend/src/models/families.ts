import Sequelize from 'sequelize';
import csv from 'csvtojson';
import db from '../schemas';
import { Family, SequelizeFamily } from '../schemas/families';
import { City } from '../schemas/cities';
import { getFamilyGroupByCode } from '../utils/constraints';
import moment from 'moment';
import logging from '../utils/logging';

/**
 * Get all items on the table without any filter
 * @param nis searched nis code
 * @param cityId logged user city ID
 * @returns Promise<List of items>
 */
export const findByNis = async (
  nis: NonNullable<Family['responsibleNis']>,
  cityId: NonNullable<City['id']>
): Promise<SequelizeFamily> => {
  const [family] = await db.families.findAll({ where: { responsibleNis: nis, cityId }, limit: 1 });
  return family;
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
 * Create or update family
 * @param family Family Object
 */
export const certifyFamilyByNIS = async (family: Family) => {
  const [createdFamily, created] = await db.families.findCreateFind({ where: { code: family.code }, defaults: family });
  if (!created) {
    // Just update the family with the new data
    return db.families.update(family, { where: { id: createdFamily.id as number } });
  } else {
    // Family was created
    return createdFamily;
  }
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
                groupName: group.key,
                responsibleName: json['nom_pessoa'],
                responsibleBirthday: moment(json['dta_nasc_pessoa'], 'DD/MM/YYYY').toDate(),
                responsibleNis: json['num_nis_pessoa_atual'],
                responsibleMotherName: json['nom_completo_mae_pessoa'],
                cityId
              };
              // Checking if a family is already created using the same family code and create if don't
              promises.push(certifyFamilyByNIS(family));
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
  const dashboard: { [key: string]: number | Date } = { total: 0 };

  const data = await db.families.findAll({
    where: { cityId },
    attributes: ['groupName', [Sequelize.fn('count', Sequelize.fn('distinct', Sequelize.col('id'))), 'count']],
    group: ['groupName']
  });

  for (const item of data) {
    const { count } = item.toJSON() as { count: number };
    dashboard[item.groupName] = Number(count);
    (dashboard.total as number) += Number(count);
  }

  const last = await db.families.max<SequelizeFamily, SequelizeFamily['createdAt']>('createdAt');
  if (last) {
    dashboard.lastCreatedDate = moment(last).toDate();
  }

  return dashboard;
};
