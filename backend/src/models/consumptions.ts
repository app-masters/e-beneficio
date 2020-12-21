import Sequelize, { Op } from 'sequelize';
import db from '../schemas';
import path from 'path';
import fs from 'fs';
import csv from 'csvtojson';
import { createObjectCsvWriter } from 'csv-writer';
import { Consumption, SequelizeConsumption } from '../schemas/consumptions';
import { PlaceStore } from '../schemas/placeStores';
import { Family } from '../schemas/families';
import { BenefitProduct } from '../schemas/benefitProducts';
import moment from 'moment';
import logging from '../utils/logging';
import { User } from '../schemas/users';
import { Place } from '../schemas/places';
import { City } from '../schemas/cities';
import { Benefit } from '../schemas/benefits';
import { Dependent } from '../schemas/depedents';
import { scrapeNFCeData } from '../utils/nfceScraper';
import { SequelizeProduct } from '../schemas/products';
import { allowedNamesList, allowedNISList } from '../utils/constraints';
import { countAll as countAllFamilies } from '../models/families';
import { countAll as countAllDependents } from '../models/dependents';

export type ProductBalance = {
  product: {
    id?: number | string;
    name?: string;
  };
  createdAt?: number | Date | null | undefined;
  amountAvailable: number;
  amountGranted: number;
  amountConsumed: number;
}[];

/**
 * Get balance report by dependent when product
 *
 * @param family the family
 */
export const getFamilyDependentBalanceProduct = async (family: Family): Promise<ProductBalance> => {
  //Family groupId
  const familyBenefits = await db.benefits.findAll({ where: { groupId: family.groupId } });
  //Filter benefit by family date
  const familyBenefitsFilterDate = familyBenefits
    .filter((benefit) => {
      const isSameMonthYear = moment(family.createdAt || moment()).isSameOrBefore(benefit.date, 'month');
      const isTodayAfterDate = moment().isSameOrAfter(moment(benefit.date));
      let isNotDeactivated = true;
      if (family.deactivatedAt) isNotDeactivated = moment(benefit.date).isBefore(moment(family.deactivatedAt));
      return isSameMonthYear && isTodayAfterDate && isNotDeactivated ? benefit : null;
    })
    .filter((f) => f);
  if (familyBenefitsFilterDate.length === 0) {
    return [];
  }
  //Get all products by benefit
  const benefitsIds = familyBenefitsFilterDate.map((item) => {
    return item.id;
  }) as number[];
  const listOfProductsAvailable = await db.benefitProducts.findAll({
    where: {
      benefitId: { [Sequelize.Op.in]: benefitsIds }
    },
    include: [{ model: db.products, as: 'product' }]
  });
  //Get all family Consumptions
  const familyConsumption = await db.consumptions.findAll({
    where: { familyId: family.id as number }
  });
  //Get all Product used by family consumption
  const consumptionIds = familyConsumption.map((item) => {
    return item.id;
  });
  const productsFamilyConsumption = await db.consumptionProducts.findAll({
    where: {
      consumptionsId: consumptionIds as number[]
    }
  });
  //Group products
  const groupedProductsAvailable: BenefitProduct[] = [];
  listOfProductsAvailable.reduce((res, value) => {
    if (!res[value.productId]) {
      res[value.productId] = {
        createdAt: value.createdAt,
        product: value.product,
        benefitId: value.benefitId,
        productId: value.productId,
        amount: 0
      };
      groupedProductsAvailable.push(res[value.productId]);
    }
    res[value.productId].amount += value.amount;
    return res;
  }, {});
  //Get difference between available products and consumed products
  const differenceProducts = groupedProductsAvailable.map((product) => {
    const items = productsFamilyConsumption.filter((f) => f.productId === product.productId);
    let amount = 0;
    if (items.length > 0)
      amount = items
        .map((item) => {
          return item.amount;
        })
        .reduce((a, b) => a + b);
    let amountDifference = product.amount;
    if (amount) {
      amountDifference = product.amount - amount;
      if (amountDifference < 0) {
        logging.critical('Family with negative amount', { family });
      }
    }
    return {
      product: { id: product.product?.id, name: product.product?.name },
      createdAt: product.createdAt,
      amountAvailable: amountDifference,
      amountGranted: product.amount,
      amountConsumed: amount ? amount : 0
    };
  });

  return differenceProducts;
};

/**
 * Get balance report by dependent when ticket
 * @param family the family
 * @param availableBenefits has benefis
 */
export const getFamilyDependentBalanceTicket = async (family: Family, availableBenefits?: Benefit[]) => {
  if (!family.dependents || !family.consumptions) {
    // Be sure that everything necessesary is populated
    const populatedFamily = await db.families.findByPk(family.id, {
      include: [
        { model: db.dependents, as: 'dependents' },
        { model: db.consumptions, as: 'consumptions' }
      ]
    });
    if (populatedFamily) {
      family = populatedFamily;
    }
  }

  if (!availableBenefits) {
    // Populating benefits if it's not available
    availableBenefits = await db.benefits.findAll({
      where: { groupId: family.groupId },
      include: [{ model: db.institutions, as: 'institution', where: { cityId: family.cityId } }]
    });
  }

  const todayDate = moment();
  let lastBenefit: Benefit | null = null;

  let balance = 0;
  for (const dependent of family.dependents as Dependent[]) {
    const dependentCreatedAt = moment(dependent.createdAt as Date);
    const dependentDeactivatedAt = moment(dependent.deactivatedAt as Date);

    for (const benefit of availableBenefits) {
      const benefitDate = moment(benefit.date as Date);
      if (benefit.groupId !== family.groupId) continue; // Don't check if it's from another group
      // Check all the dates
      const dependentRegistredBeforeBenefit = dependentCreatedAt.isSameOrBefore(moment(benefitDate).endOf('month'));
      const afterBenefitActivation = todayDate.isSameOrAfter(benefitDate);
      const dependetNotDeactivatedBeforeBenefit = dependent.deactivatedAt
        ? benefitDate.isSameOrBefore(dependentDeactivatedAt)
        : true;

      if (
        benefit.value &&
        dependentRegistredBeforeBenefit &&
        dependetNotDeactivatedBeforeBenefit &&
        afterBenefitActivation
      ) {
        // Valid benefit
        balance += Number(benefit.value);

        // Store the last benefit received
        if (!lastBenefit || (lastBenefit && moment(lastBenefit.date).isAfter(benefitDate))) {
          lastBenefit = benefit;
        }
      }
    }
  }

  if (!family.consumptions || family.consumptions.length < 1) {
    // Family without consumptions
    return balance;
  }

  // Calculating consumption
  const consumption = family.consumptions.reduce((sum, item) => sum + Number(item.value), 0);

  const lastBenefitValue = (lastBenefit?.value || 0) * (family.dependents || []).length;

  // Discount invalid values from future months
  let totalInvalidValue = family.consumptions.reduce((sum, consumption) => {
    if (consumption.createdAt && moment(consumption.createdAt).isBefore(moment(lastBenefit?.date))) {
      // Invalid value sums all the products tagged as invalid
      if (consumption.invalidValue) {
        let invalidValue = Number(consumption.invalidValue);

        // Check for the payment with money
        const paidWithMoney =
          consumption.purchaseData?.payment.reduce(
            (sum, payment) =>
              payment.name && payment.value && payment.name.toLocaleLowerCase().includes('dinheiro')
                ? sum + payment.value
                : sum,
            0
          ) || 0;

        // Invalid value does not include values paid with money
        invalidValue = Math.max(invalidValue - paidWithMoney, 0);

        // If the consumption is greater then the benefit, the diference
        // is subtracted from the invalid value
        invalidValue = invalidValue - Math.max(Number(consumption.value) - lastBenefitValue, 0);

        return sum + invalidValue;
      }
    }
    return sum;
  }, 0);

  // Invalid value cannot be greater then the benefit value
  totalInvalidValue = Math.min(totalInvalidValue, lastBenefitValue);

  return balance - consumption - totalInvalidValue;
};

/**
 * Get balance report by dependent when product
 * @param family the family
 * @param availableBenefits benefit
 */
export const getFamilyDependentBalance = async (family: Family, availableBenefits?: Benefit[]) => {
  const CONSUMPTION_TYPE = process.env.CONSUMPTION_TYPE as 'ticket' | 'product';
  if (CONSUMPTION_TYPE === 'ticket') return getFamilyDependentBalanceTicket(family, availableBenefits);
  else return getFamilyDependentBalanceProduct(family);
};

/**
 * Get balance report for all families
 * @param cityId logged user city unique ID
 */
export const getBalanceReport = async (cityId: NonNullable<City['id']>) => {
  const families = await db.families.findAll({
    where: { cityId },
    include: [
      { model: db.dependents, as: 'dependents' },
      { model: db.consumptions, as: 'consumptions', required: false }
    ]
  });

  const benefits = await db.benefits.findAll({
    include: [{ model: db.institutions, as: 'institution', where: { cityId } }]
  });

  const balanceList: (Family & { balance: number })[] = [];
  for (const family of families) {
    const balance = await getFamilyDependentBalance(family, benefits);
    balanceList.push({ ...(family.toJSON() as Family), balance: balance as number });
  }

  return balanceList;
};

/**
 * Get family balace looking for benefits and consumptions
 * @param family Family object
 */
export const getFamilyBalance = async (family: Family): Promise<number> => {
  // Get all benefits from the family group
  const familyStart = moment(family.createdAt as Date);
  const todayDate = moment();

  const [benefit] = await db.benefits.findAll({
    where: {
      [Sequelize.Op.and]: [
        {
          date: { [Sequelize.Op.gte]: familyStart.startOf('month').toDate() }
        },
        {
          date: { [Sequelize.Op.lte]: todayDate.endOf('month').toDate() }
        },
        { groupId: family.groupId }
      ]
    },
    attributes: ['groupId', [Sequelize.fn('sum', Sequelize.col('value')), 'total']],
    include: [{ model: db.institutions, as: 'institution', where: { cityId: family.cityId }, attributes: [] }],
    group: ['Benefits.groupId']
  });

  // Get all consumptions already made
  const [consumption] = await db.consumptions.findAll({
    where: { familyId: family.id as number },
    attributes: ['familyId', [Sequelize.fn('sum', Sequelize.col('value')), 'total']],
    group: ['Consumptions.familyId']
  });

  if (!benefit) {
    // No benefits created for this group yet
    return 0;
  }

  if (consumption) {
    // Some consumption is already made, removing it from the total value
    const balance = (benefit.toJSON() as { total: number }).total - (consumption.toJSON() as { total: number }).total;
    if (balance < 0) {
      logging.critical('Family with negative balance', { family });
    }
    return balance;
  }

  // No consumption, just returning the benefit;
  return (benefit.toJSON() as { total: number }).total;
};

/**
 * Create a new consumption on the store
 * @param values consumption object
 * @param placeStoreId logged user place store ID
 * @returns Promise<List of items>
 */
export const addConsumption = async (
  values: Consumption,
  placeStoreId?: NonNullable<PlaceStore['id']>
): Promise<SequelizeConsumption> => {
  // TODO: this is the main function of the entire application, but for now will be really basic
  const [consumption] = values.nfce ? await db.consumptions.findAll({ where: { nfce: values.nfce } }) : [null];
  if (consumption) {
    if (process.env.NODE_ENV === 'development') {
      return consumption;
    }
    throw { status: 409, message: 'Esse NFCe já foi registrado' };
  }

  // Checking everyting
  if (Number(values.value) < 0) {
    // Negative consumption
    throw { status: 422, message: 'Compra não pode ter valor negativo' };
  }
  const family = await db.families.findByPk(values.familyId);
  if (!family) {
    // Invalid family ID
    throw { status: 422, message: 'Família não encontrada' };
  }

  // Available balance is not checked anymore

  // Everything is ok, create it
  return db.consumptions.create({ ...values, placeStoreId });
};

/**
 * Create a new consumption on the store
 * @param values consumption object
 * @returns Promise<List of items>
 */
export const addConsumptionProduct = async (values: Consumption): Promise<SequelizeConsumption> => {
  const family = await db.families.findByPk(values.familyId);
  if (!family) {
    // Invalid family ID
    throw { status: 422, message: 'Família não encontrada' };
  }

  //Get family benefit and its products.
  const familyBenefit = await db.benefits.findAll({
    where: { groupId: family.groupId }
  });
  //Get all products by benefit
  const benefitsIds = familyBenefit.map((item) => {
    return item.id;
  }) as number[];
  const listOfProductsAvailable = await db.benefitProducts.findAll({
    where: {
      benefitId: { [Sequelize.Op.in]: benefitsIds }
    },
    include: [{ model: db.products, as: 'product' }]
  });
  //Get all family Consumptions
  const familyConsumption = await db.consumptions.findAll({
    where: { familyId: family.id as number }
  });
  //Get all Product used by family consumption
  const consumptionIds = familyConsumption.map((item) => {
    return item.id;
  });
  const productsFamilyConsumption = await db.consumptionProducts.findAll({
    where: {
      consumptionsId: consumptionIds as number[]
    }
  });
  //Get difference between available products and consumed products
  let availableProducts: BenefitProduct[] = [];
  for (const benefitProduct of listOfProductsAvailable) {
    const availableList = listOfProductsAvailable.filter((item) => item.productId === benefitProduct.productId);
    const totalAmount = availableList.reduce((total, current) => total + current.amount, 0);
    const remaining = availableProducts.filter((item) => item.productId !== benefitProduct.productId);
    availableProducts = [{ ...(benefitProduct.toJSON() as BenefitProduct), amount: totalAmount }, ...remaining];
    console.log(availableProducts);
  }

  const differenceProducts = availableProducts.map((product) => {
    const items = productsFamilyConsumption.filter((f) => f.productId === product.productId);
    let amount = 0;
    if (items.length > 0)
      amount = items
        .map((item) => {
          return item.amount;
        })
        .reduce((a, b) => a + b);
    let amountDifference = product.amount;
    if (amount) {
      amountDifference = product.amount - amount;
    }
    return {
      productId: product.productId,
      amountAvailable: amountDifference,
      amountGranted: product.amount,
      amountConsumed: amount ? amount : 0
    };
  });

  console.log(differenceProducts);

  //Compare differenceProducts with the new products
  let canConsumeAll = true;
  values.products?.map((product) => {
    const prodDiff = differenceProducts.find((f) => f.productId === product.id);
    if (!prodDiff) {
      throw { status: 422, message: 'Produto não disponivel' };
    } else {
      console.log(prodDiff);
      if (prodDiff.amountAvailable < product.amount) canConsumeAll = false;
    }
  });
  if (canConsumeAll) {
    values.value = 0;
    const newConsumption = await db.consumptions.create({ ...values }).then(async (consumption) => {
      const consumptionProducts = values.products?.map((item) => {
        return { productId: item.id, consumptionsId: consumption.id, amount: item.amount };
      });
      if (consumptionProducts) {
        await db.consumptionProducts.bulkCreate(consumptionProducts);
      }
      consumption.products = values.products;
      return consumption;
    });
    return newConsumption;
  } else {
    logging.critical('Family cannot consume', { family, values });
    throw { status: 402, message: 'Não foi possível inserir consumo' };
  }
};

/**
 * Get report for consumptions on the place on the interval
 * @param minDate start of interval
 * @param maxDate end of interval
 * @param placeId place unique ID
 * @param placeStoreId place unique ID
 * @returns Promise<List of items>
 */
export const getPlaceConsumptionsReport = async (
  minDate: Date | string,
  maxDate: Date | string,
  placeId?: NonNullable<Place['id']>,
  placeStoreId?: NonNullable<PlaceStore['id']>
) => {
  const start = moment(minDate).startOf('day');
  const end = moment(maxDate).endOf('day');

  if (!start.isValid() || !end.isValid()) {
    throw { status: 422, message: 'Invalid date provided to the query' };
  }

  const consumptions = await db.consumptions.findAll({
    where: {
      [Sequelize.Op.and]: [
        { createdAt: { [Sequelize.Op.gte]: start.toDate() } },
        { createdAt: { [Sequelize.Op.lte]: end.toDate() } },
        placeStoreId ? { placeStoreId } : {}
      ]
    },
    include: [{ model: db.placeStores, as: 'placeStore', where: placeId ? { placeId } : {} }],
    attributes: ['placeStoreId', [Sequelize.fn('sum', Sequelize.col('value')), 'total']],
    group: ['placeStore.id', 'Consumptions.placeStoreId']
  });

  const total = consumptions.reduce((sum, consumption) => sum + (consumption.toJSON() as { total: number }).total, 0);

  return { data: consumptions, total };
};

/**
 * Count how many unique families have consumptions saved on the period
 * @param dateStart period start
 * @param dateEnd period end
 * @param placeStoreId place store unique ID
 */
export const countFamilies = async (
  dateStart: Date | string | null,
  dateEnd: Date | string | null,
  placeStoreId?: PlaceStore['id']
) => {
  const [data] = await db.consumptions.findAll({
    where: {
      [Sequelize.Op.and]: [
        dateStart ? { createdAt: { [Sequelize.Op.gte]: dateStart } } : {},
        dateEnd ? { createdAt: { [Sequelize.Op.lte]: dateEnd } } : {},
        placeStoreId ? { placeStoreId } : {}
      ]
    },
    attributes: [[Sequelize.fn('count', Sequelize.fn('distinct', Sequelize.col('familyId'))), 'count']]
  });
  if (data) return Number((data.toJSON() as { count: number }).count || 0);
  return 0;
};

/**
 * Count all items on the table without any filter
 */
export const countAll = async (): Promise<number> => {
  return await db.consumptions.count();
};

/**
 * Sum the total consumption values in the period
 * @param dateStart period start
 * @param dateEnd period end
 * @param placeStoreId place store unique ID
 */
export const sumConsumptions = async (
  dateStart: Date | string | null,
  dateEnd: Date | string | null,
  placeStoreId?: PlaceStore['id']
) => {
  const [data] = await db.consumptions.findAll({
    where: {
      [Sequelize.Op.and]: [
        dateStart ? { createdAt: { [Sequelize.Op.gte]: dateStart } } : {},
        dateEnd ? { createdAt: { [Sequelize.Op.lte]: dateEnd } } : {},
        placeStoreId ? { placeStoreId } : {}
      ]
    },
    attributes: [[Sequelize.fn('sum', Sequelize.col('value')), 'total']]
  });

  if (data) return (data.toJSON() as { total: number }).total || 0;
  return 0;
};

/**
 * Count how many unique families have consumptions
 */
export const countFamilyWithoutConsumptions = async () => {
  const data = await db.families.findAll({
    include: [
      {
        model: db.consumptions,
        as: 'consumptions',
        attributes: ['id']
      }
    ]
  });
  // [Sequelize.Op.and]: [Sequelize.where(Sequelize.col('consumptions.id'), null)]
  // [Sequelize.where(Sequelize.col('consumptions.id'), null)]
  if (data && data.length > 0) {
    return data.filter((f) => f.consumptions?.length === 0).length;
  }
  return 0;
};

/**
 * Count how many unique families have consumptions
 * @param dateStart period start
 * @param dateEnd period end
 * @param placeStoreId place store unique ID
 */
export const sumInvalidConsumptions = async () => {
  const [data] = await db.consumptions.findAll({
    where: {
      [Sequelize.Op.and]: [{ invalidValue: { [Sequelize.Op.gt]: 0 } }]
    },
    attributes: [[Sequelize.fn('sum', Sequelize.col('invalidValue')), 'total']]
  });

  if (data) return (data.toJSON() as { total: number }).total || 0;
  return 0;
};

/**
 * Get consumption dashboard info
 * @param cityId logged user city ID
 * @param placeStoreId logged user place store ID
 */
export const getConsumptionDashboardInfo = async (cityId: NonNullable<City['id']>, placeStoreId?: PlaceStore['id']) => {
  const dashboardReturn = {
    familyCount: 0,
    familyWithConsumption: 0,
    consumptionCount: 0,
    invalidConsumption: 0,
    familyWithoutConsumption: 0,
    dependentCount: 0,

    todayFamilies: 0,
    weekFamilies: 0,
    monthFamilies: 0,
    todayConsumption: 0,
    weekConsumption: 0,
    monthConsumption: 0
  };

  const today = moment().toDate();
  const startToday = moment().startOf('day').toDate();
  const startWeek = moment().subtract(7, 'days').toDate();
  const startMonth = moment().subtract(30, 'days').toDate();

  // Await for all the promises
  [
    dashboardReturn.familyCount,
    dashboardReturn.familyWithConsumption,
    dashboardReturn.consumptionCount,
    dashboardReturn.invalidConsumption,
    dashboardReturn.familyWithoutConsumption,
    dashboardReturn.dependentCount,

    dashboardReturn.todayConsumption,
    dashboardReturn.weekConsumption,
    dashboardReturn.monthConsumption,
    dashboardReturn.todayFamilies,
    dashboardReturn.weekFamilies,
    dashboardReturn.monthFamilies
  ] = await Promise.all([
    countAllFamilies(),
    countFamilies(null, null, placeStoreId),
    countAll(),
    sumInvalidConsumptions(),
    countFamilyWithoutConsumptions(),
    countAllDependents(),
    sumConsumptions(startToday, today, placeStoreId),
    sumConsumptions(startWeek, today, placeStoreId),
    sumConsumptions(startMonth, today, placeStoreId),
    countFamilies(startToday, today, placeStoreId),
    countFamilies(startWeek, today, placeStoreId),
    countFamilies(startMonth, today, placeStoreId)
  ]);

  return dashboardReturn;
};

/**
 * Scrape the consumption nfce page for details about the purchase
 *
 * @param consumption Consumption object with the nfce link
 * @param shouldThrow Whether this function should throw an error or just log (used by conjobs)
 */
export const scrapeConsumption = async (consumption: Consumption, shouldThrow = false) => {
  try {
    const link = consumption.nfce;
    if (!link || !consumption.id) return;

    // Find the data avout the purchase in the Receita Federal site
    const purchaseData = await scrapeNFCeData(link);

    consumption.purchaseData = purchaseData;
    await db.consumptions.update({ purchaseData }, { where: { id: consumption.id } });

    // For each product in the purchase, check it exists and save it in the database
    await Promise.all(
      purchaseData.products.map(async ({ name }) => {
        if (!name) return;
        const existProduct = await db.products.findOne({ where: { name: { [Op.iLike]: name } } });
        if (!existProduct) {
          await db.products.create({ name });
        }
      })
    );
  } catch (error) {
    if (shouldThrow) {
      throw error;
    }
    logging.error('Failed to scrape nfce link data', error);
  }
};

/**
 * Verify a consumption to validate if all of its products are valid
 *
 * @param consumption Consumption with purchase data to be validated
 * @param shouldThrow Whether this function should throw an error or just log (used by conjobs)
 */
export const validateConsumption = async (consumption: Consumption, shouldThrow = false) => {
  try {
    const { id: consumptionId, purchaseData } = consumption;

    // If there is no purchase data, there is no data to work on
    if (!purchaseData || !consumptionId) return;

    // For each product in the purchase data, check if it exists in the database
    const products = (
      await Promise.all(
        purchaseData.products.map(async (consumptionProduct) => {
          if (!consumptionProduct.name || !consumptionProduct.totalValue) return null;
          const existingProduct = await db.products.findOne({
            where: { name: { [Op.iLike]: consumptionProduct.name } }
          });

          if (existingProduct) return { consumptionProduct, databaseProduct: existingProduct };

          return {
            consumptionProduct,
            databaseProduct: await db.products.create({ name: consumptionProduct.name })
          };
        })
      )
    ).filter((product) => !!product?.databaseProduct) as {
      consumptionProduct: { name: string; totalValue: number };
      databaseProduct: SequelizeProduct;
    }[];

    // If an error occured during the produc scraping, the name of a product could be null
    // throw an error informing the spraped object
    if (purchaseData.products.length !== products.length) {
      const error: Error & { consumption?: Consumption } = new Error(
        'Consumption may have an invalid purchaseData field'
      );
      error.consumption = JSON.parse(JSON.stringify(consumption));
      throw error;
    }

    // Check if all of the products is marked as valid
    const consumptionStatus = products.reduce(
      (status, product) => {
        // Verify the current product validation status
        const { isValid: validationStatus } = product.databaseProduct;
        const isValid = validationStatus === true;
        const isInvalid = validationStatus === false;
        const isNull = validationStatus === null || validationStatus === undefined;

        // Update the total based on its validation
        const totalValid = status.totalValid + (isValid ? product.consumptionProduct.totalValue : 0);
        const totalInvalid = status.totalInvalid + (isInvalid ? product.consumptionProduct.totalValue : 0);
        const hasInvalid = status.hasInvalid || isInvalid;
        const hasNull = status.hasNull || isNull;

        return { hasInvalid, hasNull, totalValid, totalInvalid };
      },
      { hasInvalid: false, hasNull: false, totalValid: 0, totalInvalid: 0 }
    );

    // All the products must be validated before the consumption can be reviewed
    if (consumptionStatus.hasNull) return;

    consumption.reviewedAt = moment().toDate();
    consumption.invalidValue = consumptionStatus.totalInvalid;

    await db.consumptions.update(
      { reviewedAt: consumption.reviewedAt, invalidValue: consumption.invalidValue },
      { where: { id: consumptionId } }
    );
  } catch (error) {
    if (shouldThrow) {
      throw error;
    }
    logging.critical('Failed to validate consumption', error);
  }
};

/**
 * Get report for consumptions on the place on the interval
 *
 * @param rangeFamily range of family date
 * @param rangeConsumption range of consumption date
 * @param memberCpf member cpf
 * @param onlyWithoutConsumption get only when have consumption
 * @returns Promise<List of items>
 */
export const getConsumptionFamilyReport = async (
  rangeFamily?: Date[] | string[] | null,
  rangeConsumption?: Date[] | string[] | null,
  memberCpf?: string,
  onlyWithoutConsumption?: boolean
) => {
  const placeStores = await db.placeStores.findAll();
  const familyDate = [
    moment(rangeFamily ? rangeFamily[0] : undefined)
      .startOf('day')
      .toDate(),
    moment(rangeFamily ? rangeFamily[1] : undefined)
      .startOf('day')
      .toDate()
  ];
  let families = await db.families.findAll({
    where: {
      [Sequelize.Op.and]: [
        { createdAt: { [Sequelize.Op.gte]: familyDate[0] } },
        { createdAt: { [Sequelize.Op.lte]: familyDate[1] } }
      ]
    },
    include: [
      { model: db.consumptions, as: 'consumptions' },
      { model: db.dependents, as: 'dependents' }
    ]
  });

  if (memberCpf) {
    families = families.filter((family: Family) => {
      const responsible = family.dependents?.find((dependent: Dependent) => dependent.isResponsible);
      return responsible?.cpf === memberCpf;
    });
  }

  if (onlyWithoutConsumption) {
    families = families.filter((family: Family) => {
      return !family.consumptions || family.consumptions?.length === 0;
    });
  }

  if (rangeConsumption) {
    const consumptionDate = [
      moment(rangeConsumption ? rangeConsumption[0] : undefined)
        .startOf('day')
        .toDate(),
      moment(rangeConsumption ? rangeConsumption[1] : undefined)
        .startOf('day')
        .toDate()
    ];
    families = families.filter((family: Family) => {
      const list = family.consumptions?.filter((consumption: Consumption) =>
        moment(consumption.createdAt as Date).isBetween(moment(consumptionDate[0]), moment(consumptionDate[1]))
      );
      return list && list?.length > 0 && family;
    });
  }
  return await Promise.all(
    families.map(async (family: Family) => {
      const balance = await getFamilyDependentBalanceProduct(family);
      const placeStore = placeStores.find((placeStore: PlaceStore) => placeStore.id === family.placeStoreId);
      return {
        familyId: family.id,
        responsible: family.dependents?.find((dependent: Dependent) => dependent.isResponsible),
        createdAt: family.createdAt,
        placeStore: placeStore ? placeStore.title : undefined,
        neverConsumed: !!!family.consumptions || family.consumptions?.length === 0,
        consumedAll: balance.filter((product) => product.amountAvailable > 0).length === 0
      };
    })
  );
};

/**
 * Get report for consumptions on the place on the interval
 * @param rangeConsumption range of consumption date
 * @returns Promise<List of items>
 */
export const getConsumptionPlaceStoreReport = async (rangeConsumption?: Date[] | string[] | null) => {
  const placeStores = await db.placeStores.findAll({
    include: [
      {
        model: db.families,
        as: 'families'
      }
    ]
  });

  await Promise.all(
    placeStores.map(async (placeStore: PlaceStore) => {
      await Promise.all(
        placeStore.families.map(async (family: Family) => {
          family.balance = await getFamilyDependentBalanceProduct(family);
        })
      );
    })
  );

  const reportList: any[] = [];
  placeStores.map((placeStore: PlaceStore) => {
    let familyConsumption = 0;
    let familyAvailable = 0;
    if (placeStore.families)
      placeStore.families.map((family: Family) => {
        (family.balance as ProductBalance)?.map((balance) => {
          familyConsumption += balance.amountConsumed;
          if (rangeConsumption) {
            if (balance.amountAvailable > 0) {
              const isBetween = moment(balance.createdAt as Date).isBetween(
                moment(rangeConsumption[0]),
                moment(rangeConsumption[1])
              );
              familyAvailable += isBetween ? balance.amountAvailable : 0;
            } else {
              familyAvailable += balance.amountAvailable;
            }
          } else familyAvailable += balance.amountAvailable;
        });
      });

    const report = {
      placeStore: placeStore.title,
      familiesAmount: placeStore.families.length,
      consumedAmount: familyConsumption,
      consumedAvailable: familyAvailable
    };
    reportList.push(report);
  });

  return reportList;
};

type TicketItem = {
  Portador: string;
  'Id Adicional': string;
  Cartão: string;
  'Dt Proces.': string;
  'Dt Trans.': string;
  Tipo: string;
  NSU: string;
  Estabelecimento: string;
  Valor: string;
  Operação: string;
  Status: string;
};

type ReportItem = {
  createdAt?: string;
  responsibleNis?: string;
  responsibleName?: string;
  numberOfDependents?: number | string;
  balance?: number | string;
  invalidValue?: number | string;
  hasDeclaredSomething?: string | boolean; // humanized boolean
  hasConsumedSomething?: string | boolean; // humanized boolean
  hasDeclaredAll?: string | boolean; // humanized boolean
  nextBenefit?: number | string;
  nextBenefitWithDiscounts?: number | string;
  consumedValue?: number | string;
  declaredValue?: number | string;
  nisOnList?: string | boolean;
  nameOnList?: string | boolean;
  dates?: string;
};

/**
 * Generate report for Ticket file
 * @param filePath file absolute path
 * @param cityId logged user unique city ID
 * @param startDate desired start date
 * @param endDate desired finish date
 */
export const generateTicketReport = async (
  filePath: string,
  cityId: NonNullable<City['id']>,
  startDate?: string,
  endDate?: string
) => {
  // Reading ticket file
  const ticketFile: TicketItem[] = await csv({ delimiter: ';', flatKeys: true }).fromFile(filePath);

  const requiredFields = ['Id Adicional', 'Valor', 'Opera��o'];
  const availableFields = Object.keys(ticketFile[0]);
  for (const field of requiredFields) {
    if (availableFields.indexOf(field) < 0) {
      throw {
        status: 412,
        message: `O campo ${field} não está presente na planilha da Ticket enviada`
      };
    }
  }

  // Getting relevant info
  const families = await db.families.findAll({
    where: { cityId },
    include: [
      { model: db.dependents, as: 'dependents' },
      {
        model: db.consumptions,
        as: 'consumptions',
        required: false,
        where: {
          [Sequelize.Op.and]: [
            {
              createdAt: { [Sequelize.Op.gte]: moment(startDate, 'DD-MM-YYYY').startOf('day').toDate() }
            },
            {
              createdAt: { [Sequelize.Op.lte]: moment(endDate, 'DD-MM-YYYY').endOf('day').toDate() }
            }
          ]
        }
      }
    ]
  });

  let declaredAllCount = 0;
  const allBenefits = await db.benefits.findAll({
    include: [{ model: db.institutions, as: 'institution', where: { cityId } }]
  });

  // Creating report file
  const reportPath = `${path.dirname(__dirname)}/../database/storage/ticket_report_${cityId}.csv`;
  // Create file
  fs.writeFileSync(reportPath, '');
  const csvFileWriter = createObjectCsvWriter({
    path: reportPath,
    header: [
      { id: 'responsibleNis', title: 'NIS do responsável' },
      { id: 'responsibleName', title: 'Nome do responsável' },
      { id: 'numberOfDependents', title: 'Quantidade de dependentes' },
      { id: 'hasDeclaredAll', title: 'Declarou tudo?' },
      { id: 'hasDeclaredSomething', title: 'Declarou algo?' },
      { id: 'hasConsumedSomething', title: 'Consumiu algo? (Ticket)' },
      { id: 'declaredValue', title: 'Valor declarado' },
      { id: 'consumedValue', title: 'Valor consumido (Ticket)' },
      { id: 'invalidValue', title: 'Valor inválido declarado' },
      { id: 'nextBenefit', title: 'Valor bruto do benefício' },
      { id: 'nextBenefitWithDiscounts', title: 'Valor do benefício com os descontos' },
      { id: 'nisOnList', title: 'NIS nas exceções' },
      { id: 'nameOnList', title: 'Nome nas exceções' },
      { id: 'createdAt', title: 'Data de criação' },
      { id: 'dates', title: 'Datas de declaração' }
    ]
  });

  const report: ReportItem[] = [];

  for (const family of families) {
    // Generating a report item for each family
    const reportItem: ReportItem = {};

    // Filling basic data
    reportItem.createdAt = moment(family.createdAt as Date).format('DD/MM/YYYY');
    reportItem.responsibleNis = family.responsibleNis;
    reportItem.responsibleName = family.responsibleName;
    reportItem.numberOfDependents = family.dependents?.length || 0;
    reportItem.hasDeclaredSomething = (family.consumptions || []).length > 0;
    reportItem.dates = (family.consumptions || [])
      .map((consumption) => moment(consumption.createdAt as Date).format('DD/MM/YYYY'))
      .join(' - ');

    reportItem.declaredValue = family.consumptions?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;

    // Dealing with true consumed values
    const ticketPurchases = ticketFile.filter(
      (item) => item['Id Adicional'] === family.responsibleNis && item['Opera��o'].toUpperCase() === 'DEBITO'
    );
    reportItem.hasConsumedSomething = ticketPurchases.length > 0;
    reportItem.consumedValue = ticketPurchases.reduce((sum, item) => sum + Number(item['Valor'].replace(',', '.')), 0);
    const hasDeclaredAll =
      Math.abs(reportItem.declaredValue - reportItem.consumedValue) < 1 ||
      reportItem.declaredValue > reportItem.consumedValue;
    reportItem.hasDeclaredAll = hasDeclaredAll;
    if (hasDeclaredAll) declaredAllCount++;

    // Getting benefit value
    const lastBenefit = allBenefits[allBenefits.length - 1];
    reportItem.nextBenefit = (lastBenefit.value || 0) * (family.dependents || []).length;

    // Sum the invalid values of the family consumptions
    reportItem.invalidValue = (family.consumptions || []).reduce((sum, consumption) => {
      // Invalid value sums all the products tagged as invalid
      if (consumption.invalidValue) {
        let invalidValue = Number(consumption.invalidValue);

        // Check for the payment with money
        const paidWithMoney =
          consumption.purchaseData?.payment.reduce(
            (sum, payment) =>
              payment.name && payment.value && payment.name.toLocaleLowerCase().includes('dinheiro')
                ? sum + payment.value
                : sum,
            0
          ) || 0;

        // Invalid value does not include values paid with money
        invalidValue = Math.max(invalidValue - paidWithMoney, 0);

        // If the consumption is greater then the benefit, the diference
        // is subtracted from the invalid value
        invalidValue = invalidValue - Math.max(Number(consumption.value) - Number(reportItem.nextBenefit), 0);

        return sum + invalidValue;
      }
      return sum;
    }, 0);

    // Invalid value cannot be greater then the benefit value
    reportItem.invalidValue = Math.min(reportItem.invalidValue, reportItem.nextBenefit);

    // Invalid value cannot be less than zero
    reportItem.invalidValue = Math.max(reportItem.invalidValue, 0);

    reportItem.nameOnList = allowedNamesList.indexOf(family.responsibleName as string) > -1;
    reportItem.nisOnList = allowedNISList.indexOf(family.responsibleNis as string) > -1;

    if (!reportItem.nameOnList && !reportItem.nisOnList) {
      reportItem.nextBenefitWithDiscounts =
        reportItem.nextBenefit * (!reportItem.hasConsumedSomething || reportItem.hasDeclaredSomething ? 1 : 0.7) -
        Number(reportItem.invalidValue);
    } else {
      reportItem.nextBenefitWithDiscounts = reportItem.nextBenefit - Number(reportItem.invalidValue);
    }

    reportItem.nextBenefitWithDiscounts = Math.max(reportItem.nextBenefitWithDiscounts, 0);

    report.push(reportItem);

    // Humanizing booleans
    reportItem.nameOnList = reportItem.nameOnList ? 'Sim' : 'Não';
    reportItem.nisOnList = reportItem.nisOnList ? 'Sim' : 'Não';
    reportItem.hasDeclaredSomething = reportItem.hasDeclaredSomething ? 'Sim' : 'Não';
    reportItem.hasDeclaredAll = reportItem.hasDeclaredAll ? 'Sim' : 'Não';
    reportItem.hasConsumedSomething = reportItem.hasConsumedSomething ? 'Sim' : 'Não';

    // Making money the right format
    reportItem.invalidValue = reportItem.invalidValue.toFixed(2).replace('.', ',');
    reportItem.consumedValue = reportItem.consumedValue.toFixed(2).replace('.', ',');
    reportItem.declaredValue = reportItem.declaredValue.toFixed(2).replace('.', ',');
    reportItem.nextBenefit = reportItem.nextBenefit.toFixed(2).replace('.', ',');
    reportItem.nextBenefitWithDiscounts = reportItem.nextBenefitWithDiscounts.toFixed(2).replace('.', ',');
  }
  await csvFileWriter.writeRecords(report);

  console.log(`[report] ${declaredAllCount} declared all`);
  return path.resolve(reportPath);
};

/**
 * Soft delete a consumption
 * @param id index of the desired consumption
 * @param reason reason of the deletion
 * @param user logged user
 */
export const deleteById = async (id: NonNullable<Consumption['id']>, reason: string, user: User) => {
  const consumption = await db.consumptions.findByPk(id);
  if (!consumption) throw { status: 404, message: 'not found' };

  // Filling data about the deletion
  await db.consumptions.update({ deletedBy: user.id, deleteReason: reason }, { where: { id } });

  await db.consumptions.destroy({ where: { id } });
};
