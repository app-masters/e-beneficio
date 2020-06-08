import Sequelize, { Op } from 'sequelize';
import db from '../schemas';
import { Consumption, SequelizeConsumption } from '../schemas/consumptions';
import { PlaceStore } from '../schemas/placeStores';
import { Family } from '../schemas/families';
import moment from 'moment';
import logging from '../utils/logging';
import { Place } from '../schemas/places';
import { City } from '../schemas/cities';
import { Benefit } from '../schemas/benefits';
import { Dependent } from '../schemas/depedents';
import { scrapeNFCeData } from '../utils/nfceScraper';
import { SequelizeProduct } from '../schemas/products';

/**
 * Get balance report by dependent when product
 * @param family the family
 */
export const getFamilyDependentBalanceProduct = async (family: Family) => {
  //Family groupName
  const familyBenefits = await db.benefits.findAll({ where: { groupName: family.groupName } });
  //Filter benefit by family date
  const familyBenefitsFilterDate = familyBenefits
    .filter((benefit) => {
      const isAfter = moment(benefit.date).isSameOrAfter(moment(family.createdAt || moment()));
      let isBefore = true;
      if (family.deactivatedAt) isBefore = moment(benefit.date).isBefore(moment(family.deactivatedAt));
      return isAfter && isBefore ? benefit : null;
    })
    .filter((f) => f);
  if (familyBenefitsFilterDate.length === 0) {
    throw { status: 422, message: 'Nenhum benefício disponível' };
  }
  //Get all products by benefit
  const benefitsIds = familyBenefitsFilterDate.map((item) => {
    return item.id;
  });
  const listOfProductsAvailable = await db.benefitProducts.findAll({
    where: {
      benefitsId: benefitsIds as number[]
    },
    include: [{ model: db.products, as: 'products' }]
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
  const differenceProducts = listOfProductsAvailable.map((product) => {
    const items = productsFamilyConsumption.filter((f) => f.productsId === product.productsId);
    // const item = productsFamilyConsumption.find((f) => f.productsId === product.productsId);
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
      product: { id: product.products?.id, name: product.products?.name },
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
      where: { groupName: family.groupName },
      include: [{ model: db.institutions, as: 'institution', where: { cityId: family.cityId } }]
    });
  }

  const todayMonth = moment().month() + 1;
  const todayYear = moment().year();

  let balance = 0;
  for (const dependent of family.dependents as Dependent[]) {
    const startMonth = moment(dependent.createdAt as Date).month() + 1;
    const startYear = moment(dependent.createdAt as Date).year();
    const endMonth = moment(dependent.deactivatedAt as Date).month() + 1;
    const endYear = moment(dependent.deactivatedAt as Date).year();

    for (const benefit of availableBenefits) {
      const benefitDate = moment(benefit.date);
      if (benefit.groupName !== family.groupName) continue; // Don't check if it's from another group

      // Check all the dates
      const notInFuture =
        benefitDate.year() < todayYear || (benefitDate.year() === todayYear && benefitDate.month() + 1 <= todayMonth);
      const afterCreation =
        benefitDate.year() > startYear || (benefitDate.year() === startYear && benefitDate.month() + 1 >= startMonth);
      const beforeDeactivation = dependent.deactivatedAt
        ? benefitDate.year() < endYear || (benefitDate.year() === endYear && benefitDate.month() + 1 < endMonth)
        : true;

      if (benefit.value && notInFuture && afterCreation && beforeDeactivation) {
        // Valid benefit
        balance += Number(benefit.value);
      }
    }
  }

  if (!family.consumptions || family.consumptions.length < 1) {
    // Family without consumptions
    return balance;
  }

  // Calculating consumption
  const consumption = family.consumptions.reduce((sum, item) => sum + Number(item.value), 0);
  return balance - consumption;
};

/**
 * Get balance report by dependent when product
 * @param family the family
 * @param availableBenefits benefit
 */
export const getFamilyDependentBalance = async (family: Family, availableBenefits?: Benefit[]) => {
  const isTicket = process.env.CONSUMPTION_TYPE === 'ticket';
  if (isTicket) return getFamilyDependentBalanceTicket(family, availableBenefits);
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

  const familyStartMonth = moment(family.createdAt as Date).month() + 1;
  const familyStartYear = moment(family.createdAt as Date).year();
  const todayMonth = moment().month() + 1;
  const todayYear = moment().year();

  const [benefit] = await db.benefits.findAll({
    where: {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.or]: [
            { year: { [Sequelize.Op.gt]: familyStartYear } },
            { year: familyStartYear, month: { [Sequelize.Op.gte]: familyStartMonth } }
          ]
        },
        {
          [Sequelize.Op.or]: [
            { year: { [Sequelize.Op.lt]: todayYear } },
            { year: todayYear, month: { [Sequelize.Op.lte]: todayMonth } }
          ]
        },
        { groupName: family.groupName }
      ]
    },
    attributes: ['groupName', [Sequelize.fn('sum', Sequelize.col('value')), 'total']],
    include: [{ model: db.institutions, as: 'institution', where: { cityId: family.cityId }, attributes: [] }],
    group: ['Benefits.groupName']
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

  const balance = await getFamilyDependentBalance(family);
  if (balance < Number(values.value)) {
    // Insuficient balance
    throw { status: 422, message: 'Saldo insuficiente' };
  }
  // Everything is ok, create it
  return db.consumptions.create({ ...values, placeStoreId });
};

/**
 * Create a new consumption on the store
 * @param values consumption object
 * @param placeStoreId logged user place store ID
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
    where: { groupName: family.groupName }
  });
  //Get all products by benefit
  const benefitsIds = familyBenefit.map((item) => {
    return item.id;
  });
  const listOfProductsAvailable = await db.benefitProducts.findAll({
    where: {
      benefitsId: benefitsIds as number[]
    },
    include: [{ model: db.products, as: 'products' }]
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
  const differenceProducts = listOfProductsAvailable.map((product) => {
    const items = productsFamilyConsumption.filter((f) => f.productsId === product.productsId);
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
      productId: product.productsId,
      amountAvailable: amountDifference,
      amountGranted: product.amount,
      amountConsumed: amount ? amount : 0
    };
  });
  //Compare differenceProducts with the new products
  let canConsumeAll = true;
  values.products?.map((product) => {
    const prodDiff = differenceProducts.find((f) => f.productId === product.id);
    if (!prodDiff) {
      throw { status: 422, message: 'Produto não disponivel' };
    } else {
      if (prodDiff.amountAvailable < product.amount) canConsumeAll = false;
    }
  });
  if (canConsumeAll) {
    values.value = 0;
    const newConsumption = await db.consumptions.create({ ...values }).then(async (consumption) => {
      const consumptionProducts = values.products?.map((item) => {
        return { productsId: item.id, consumptionsId: consumption.id, amount: item.amount };
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
  dateStart: Date | string,
  dateEnd: Date | string,
  placeStoreId?: PlaceStore['id']
) => {
  const [data] = await db.consumptions.findAll({
    where: {
      [Sequelize.Op.and]: [
        { createdAt: { [Sequelize.Op.gte]: dateStart } },
        { createdAt: { [Sequelize.Op.lte]: dateEnd } },
        placeStoreId ? { placeStoreId } : {}
      ]
    },
    attributes: [[Sequelize.fn('count', Sequelize.fn('distinct', Sequelize.col('familyId'))), 'count']]
  });
  if (data) return Number((data.toJSON() as { count: number }).count || 0);
  return 0;
};

/**
 * Sum the total consumption values in the period
 * @param dateStart period start
 * @param dateEnd period end
 * @param placeStoreId place store unique ID
 */
export const sumConsumptions = async (
  dateStart: Date | string,
  dateEnd: Date | string,
  placeStoreId?: PlaceStore['id']
) => {
  const [data] = await db.consumptions.findAll({
    where: {
      [Sequelize.Op.and]: [
        { createdAt: { [Sequelize.Op.gte]: dateStart } },
        { createdAt: { [Sequelize.Op.lte]: dateEnd } },
        placeStoreId ? { placeStoreId } : {}
      ]
    },
    attributes: [[Sequelize.fn('sum', Sequelize.col('value')), 'total']]
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
    dashboardReturn.todayConsumption,
    dashboardReturn.weekConsumption,
    dashboardReturn.monthConsumption,
    dashboardReturn.todayFamilies,
    dashboardReturn.weekFamilies,
    dashboardReturn.monthFamilies
  ] = await Promise.all([
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
