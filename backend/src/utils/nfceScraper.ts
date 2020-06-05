import { PurchaseData } from '../schemas/consumptions';
import Axios from 'axios';
import https from 'https';
import cheerio from 'cheerio';

const axios = Axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

/**
 * Scrape the consumption data from the nfce.fazenda.mg.gov.br site
 *
 * @param nfce NFC-e link
 *
 * @returns A object containg the place, total value, payment and products.
 */
export const scrapeNFCeData = async (nfce: string): Promise<PurchaseData> => {
  // Request the Receita Federal site and process it with cheerio
  const page = await axios.get(nfce);
  const document = cheerio.load(page.data);

  // Get the name of the store
  const place = (document('div#collapse4 > table > tbody > tr > td').first().text().trim() ||
    document('.text-center.text-uppercase > h4 > b').first().text().trim()) as string | undefined;

  // Search for the total paid in the purchase
  let totalValue: undefined | number;
  document('div.row').each((index, node) => {
    if (document(node).find('div > strong').first().text().trim() === 'Valor total R$') {
      totalValue = Number(document(node).find('div:nth-child(2) > strong').first().text().trim());
    }
  });

  // Create a list of products with name and total value
  let products: { name?: string; totalValue?: number }[] = [];
  document('#myTable > tr').each((index, node) => {
    const rawName = document(node).find('td > h7').first().text() as string | undefined;
    const rawValue = document(node).find('td:nth-child(4)').first().text() as string | undefined;

    const name = rawName ? rawName.trim() : undefined;
    const totalValue = rawValue
      ? Number(
          rawValue
            .substring(rawValue.lastIndexOf('$') + 1)
            .replace(/,/g, '.')
            .trim()
        )
      : undefined;
    products.push({ name, totalValue });
  });

  // Create a list of payment with name and value
  const payment: { name?: string; value?: number }[] = [];
  const paymentRows = document('div.row');
  paymentRows.each((index, node) => {
    if (document(node).find('div > strong').first().text().trim() === 'Valor pago R$') {
      const rawValue = document(node).find('div:nth-child(2) > strong').first().text().trim();
      const rawName = document(paymentRows[index + 1])
        .find('div:nth-child(2) > strong')
        .first()
        .text()
        .trim();

      const name = rawName ? rawName.trim() : undefined;
      const value = rawValue
        ? Number(
            rawValue
              .substring(rawValue.lastIndexOf('$') + 1)
              .replace(/,/g, '.')
              .trim()
          )
        : undefined;
      payment.push({ name, value });
    }
  });

  // In some cases, the same order can have the same item multiple times, this
  // can generate duplicated products in the database.
  const productSet = new Set(products.map((product) => product.name));
  products = Array.from(productSet).reduce(
    (list, productName) => [
      ...list,
      {
        name: productName,
        totalValue: products
          .filter((p) => p.name === productName)
          .reduce((total, value) => total + (value.totalValue ? value.totalValue : 0), 0)
      }
    ],
    [] as { name?: string; totalValue?: number }[]
  );

  return { place, totalValue, products, payment };
};
