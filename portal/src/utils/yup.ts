import * as yup from 'yup';
import { array, boolean, date, mixed, number, object, string } from '../locales/yup';

yup.setLocale({
  mixed,
  string,
  number,
  date,
  boolean,
  object,
  array
});

// eslint-disable-next-line import/no-default-export
export default yup;
