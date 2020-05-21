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
