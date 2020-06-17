/**
 * Format string to date DD/MM/YYYY
 */
export const formatDate = (text: string) => {
  let string = text;
  string = string.replace(/\D/g, '');
  string = string.replace(/(\d{2})(\d)/, '$1/$2');
  string = string.replace(/(\d{2})(\d)/, '$1/$2');
  string = string.replace(/(\d{2})(\d{2})$/, '$1$2');
  return string;
};

/**
 * Format Money string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatMoney = (amount: any, decimalCount = 2, decimal = ',', thousands = '.') => {
  decimalCount = Math.abs(decimalCount);
  decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

  const negativeSign = amount < 0 ? '-' : '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const i: any = parseInt((amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))).toString();
  const j = i.length > 3 ? i.length % 3 : 0;

  return (
    negativeSign +
    (j ? i.substr(0, j) + thousands : '') +
    i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
    (decimalCount
      ? decimal +
        Math.abs(amount - i)
          .toFixed(decimalCount)
          .slice(2)
      : '')
  );
};
