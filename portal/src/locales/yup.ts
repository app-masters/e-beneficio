/* eslint-disable no-template-curly-in-string */
import { LocaleObject } from 'yup';

// Ref: https://github.com/jquense/yup/blob/master/src/locale.js
const printValue = require('yup/lib/util/printValue');

export const mixed: LocaleObject['mixed'] = {
  default: '${path} está inválido',
  required: '${path} é um campo obrigatório',
  oneOf: '${path} precisa ser igual a algum dos seguintes valores: ${values}',
  notOneOf: '${path} não deve ser igual a algum dos seguintes valores: ${values}',
  notType: ({ path, type, value, originalValue }) => {
    const isCast = originalValue != null && originalValue !== value;
    let msg =
      `${path} deve ser do tipo \`${type}\`, ` +
      `mas o resultado final é: \`${printValue(value, true)}\`` +
      (isCast ? ` (cast a partir do valor \`${printValue(originalValue, true)}\`).` : '.');

    if (value === null) {
      msg += `\n Se "null" deve ser considerado como um valor vazio, garanta que o schema tenha \`.nullable()\``;
    }

    return msg;
  }
};

export const string: LocaleObject['string'] = {
  length: '${path} precisa ter exatamente ${length} caracteres',
  min: '${path} precisa ter no mínimo ${min} caracteres',
  max: '${path} precisa ter no máximo ${max} caracteres',
  matches: '${path} precisa dar match com: "${regex}"',
  email: '${path} precisa ser um e-mail válido',
  url: '${path} precisa ser uma URL válida',
  trim: '${path} não pode ter espaços no fim ou no início',
  lowercase: '${path} deve estar em minúsculo',
  uppercase: '${path} deve estar em maiúsculo'
};

export const number: LocaleObject['number'] & { notEqual: string } = {
  min: '${path} precisa ser maior ou igual a ${min}',
  max: '${path} precisa ser menor ou igual a ${max}',
  lessThan: '${path} precisa ser menor que ${less}',
  moreThan: '${path} precisa ser maior que ${more}',
  notEqual: '${path} não deve ser igual a ${notEqual}',
  positive: '${path} precisa ser um número positivo',
  negative: '${path} precisa ser um número negativo',
  integer: '${path} precisa ser um número inteiro'
};

export const date: LocaleObject['date'] = {
  min: '${path} precisa vir depois de ${min}',
  max: '${path} previsa vir antes de ${max}'
};

export const boolean: LocaleObject['boolean'] = {};

export const object: LocaleObject['object'] = {
  noUnknown: '${path} não pode ter chaves não específicadas no seu object shape'
};

export const array: LocaleObject['array'] = {
  min: '${path} precisa ter no mínimo ${min} itens',
  max: '${path} precisa ter ${max} ou menos itens'
};
