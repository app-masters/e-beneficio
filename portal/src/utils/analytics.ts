import ReactGA from 'react-ga';
import { env } from '../env';

// Read the traking id from the environment variables
const trackingID = env.REACT_APP_ENV_GA_TRACKING_ID;

/**
 * Initialize the Google Analytics lib
 */
export const init = () => {
  if (trackingID) {
    ReactGA.initialize(trackingID);
  }
};

/**
 * Track page view with Google Analytics
 */
export const pageView = () => {
  ReactGA.pageview(window.location.pathname + window.location.search);
};

/**
 * Event - Add custom tracking event.
 * @param label Event label
 * @param category Event category
 * @param action Event action
 */
export const event = (label: string, category: string, action: string) => {
  ReactGA.event({
    category: category,
    action: action,
    label: label
  });
};

export default { init, pageView, event };
