import { styleBreakpoints } from './theme';

/**
 * Creates a media query for the parameters you gave it to.
 */
export default (min: keyof typeof styleBreakpoints, max?: keyof typeof styleBreakpoints | boolean) => {
  if (typeof max === 'boolean') return `@media screen and (max-width:${styleBreakpoints[min]})`;
  if (!max) return `@media screen and (min-width:${styleBreakpoints[min]})`;
  return `@media screen and (min-width:${styleBreakpoints[min]}) and (max-width:${styleBreakpoints[max]})`;
};
