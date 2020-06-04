import puppeteer from 'puppeteer';
import { PurchaseData } from '../schemas/consumptions';

/**
 * This line is needed to workaround the warning:
 *
 * MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
 * 11 SIGTERM listeners added to [process].
 * Use emitter.setMaxListeners() to increase limit
 *
 * ```
 *   Every chrome instance adds a listener to the process's "exit" event to cleanup properly.
 *   12 chrome instances add 12 listeners, which yields the warning.
 * ```
 * See: https://github.com/puppeteer/puppeteer/issues/594
 */
process.setMaxListeners(Infinity);

// eslint-disable-next-line no-var
var document: any;

/**
 * Scrape the consumption data from the nfce.fazenda.mg.gov.br site
 *
 * @param nfce NFC-e link
 *
 * @returns A object containg the place, total value, payment and products.
 */
export const scrapeNFCeData = async (nfce: string): Promise<PurchaseData> => {
  const browser = await puppeteer.launch({ ignoreHTTPSErrors: true });
  const page = await browser.newPage();
  await page.goto(nfce);
  const result = await page.evaluate(() => {
    // Get the name of the store
    const place: string | undefined =
      document.querySelector('div#collapse4 > table > tbody > tr > td')?.innerText ||
      document.querySelector('.text-center.text-uppercase > h4 > b')?.innerText.innerText;

    // Search for the total paid in the purchase
    let totalValue: undefined | number;
    document.querySelectorAll('div.row').forEach((node: any) => {
      if (node.querySelector('div > strong')?.innerText === 'Valor total R$') {
        totalValue = Number(node.querySelector('div:nth-child(2) > strong')?.innerText);
      }
    });

    // Create a list of products with name and total value
    const products: { name?: string; totalValue?: number }[] = [];
    document.querySelectorAll('#myTable > tr').forEach((node: any) => {
      const rawName = node.querySelector('td > h7')?.innerText as string | undefined;
      const rawValue = node.querySelector('td:nth-child(4)')?.innerText as string | undefined;

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
    const paymentRows = document.querySelectorAll('div.row');
    paymentRows.forEach((node: any, index: number) => {
      if (node.querySelector('div > strong')?.innerText === 'Valor pago R$') {
        const rawValue = node.querySelector('div:nth-child(2) > strong')?.innerText;
        const rawName = paymentRows[index + 1].querySelector('div:nth-child(2) > strong')?.innerText;

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

    return { place, totalValue, payment, products };
  });

  await browser.close();
  return result;
};
