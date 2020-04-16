import Sequelize from 'sequelize';
import csv from 'csvtojson';
import db from '../schemas';
import { Family, SequelizeFamily } from '../schemas/families';
import { City } from '../schemas/cities';
import { getFamilyGroupByCode, familyGroupList } from '../utils/constraints';
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
  const handledIds = [] as Family['id'][];
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
              if (json['cod_parentesco_rf_pessoa'] !== '1') {
                // We're only saving people that are the responsible for the family (RF)
                reportResult.wrong++;
                reportResult.report.push(`[linha: ${lineNumber}] Pessoa ${json['nom_pessoa']} não é um RF`);
                return;
              }
              if (!getFamilyGroupByCode(json.d['fx_rfpc'])) {
                reportResult.wrong++;
                reportResult.report.push(
                  `[linha: ${lineNumber}] Família ${json['cod_familiar_fam']} está com um valor inválido de fx_rfpc`
                );
              }
              // Converting CSV format to DB format
              const family = {
                code: json.d['cod_familiar_fam'],
                groupName: getFamilyGroupByCode(json.d['fx_rfpc'])?.key,
                responsibleName: json['nom_pessoa'],
                responsibleBirthday: moment(json['dta_nasc_pessoa'], 'DD/MM/YYYY').toDate(),
                responsibleNis: json['num_nis_pessoa_atual'],
                responsibleMotherName: json['nom_completo_mae_pessoa'],
                cityId
              };
              // Checking if a family is already created using the same family code
              const [alreadyCreated] = await db.families.findAll({ where: { code: family.code } });
              if (alreadyCreated) {
                // Just update the family with the new data
                await db.families.update(family, { where: { id: alreadyCreated.id as number } });
                handledIds.push(alreadyCreated.id);
                reportResult.updated++;
              } else {
                // Create new family
                const newFamily = await db.families.create(family);
                handledIds.push(newFamily.id);
                reportResult.created++;
              }
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
        () => {
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
