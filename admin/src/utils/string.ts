/**
 * Mask to brazilian format of phone
 */
export const formatPhone = (v?: string | null): string => {
  if (!v) return '';
  v = v.replace(/\D/g, '');
  if (v.length > 9) {
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d)(\d{4})$/, '$1-$2');
  } else if (v.length > 4) {
    v = v.replace(/(\d)(\d{4})$/, '$1-$2');
  }
  return v;
};

/**
 * Mask and format color string
 */
export const formatColor = (v?: string | null): string => {
  if (!v) return '';
  // Remove non HEX characters
  v = v.replace(/([^A-Fa-f0-9])/g, '');
  return '#' + v;
};

/**
 * Mask and format CPF string
 */
export const formatCPF = (v?: string | null): string => {
  if (!v) return '';
  // Remove anything that is not a number
  v = v.replace(/\D/g, '').substr(0, 11);
  v = v.replace(/^(\d{3})(\d)/, '$1.$2');
  v = v.replace(/^(\d{3}.\d{3})(\d)/, '$1.$2');
  v = v.replace(/^(\d{3}.\d{3}.\d{3})(\d{1,2})/, '$1-$2');
  return v;
};

/**
 * Mask and format CNPJ string
 */
export const formatCNPJ = (v?: string | null): string => {
  if (!v) return '';
  // Remove anything that is not a number
  v = v.replace(/\D/g, '').substr(0, 14);
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2}.\d{3})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2}.\d{3}.\d{3})(\d)/, '$1/$2');
  v = v.replace(/^(\d{2}.\d{3}.\d{3}\/\d{4})(\d{1,2})/, '$1-$2');
  return v;
};

/**
 * Format CEP string
 */
export const formatCEP = (v?: string | null): string => {
  if (!v) return '';
  // Remove anything that is not a number
  v = v.replace(/\D/g, '').substr(0, 8);
  v = v.replace(/^(\d{5})(\d)/, '$1-$2');
  return v;
};
