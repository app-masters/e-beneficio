import variables from './variables';

export const breakpoints = {
  mobile: 576,
  tablet: 768,
  medium: 992,
  laptop: 1025,
  desktop: 1440
};

export const styleBreakpoints = {
  xs: `${breakpoints.mobile}px`,
  sm: `${breakpoints.tablet}px`,
  md: `${breakpoints.medium}px`,
  lg: `${breakpoints.laptop}px`,
  xl: `${breakpoints.desktop}px`
};

const colors = {
  background: '#f6f7f8',
  agendaRoomBackground: '#999',
  agendaRoomBorder: '#000',
  ...variables
};

export type SpacingList = {
  /**
   * 0px
   */
  none: string;
  /**
   * 4px
   */
  xs: string;
  /**
   * 8px
   */
  sm: string;
  /**
   * 16px
   */
  default: string;
  /**
   * 32px
   */
  md: string;
  /**
   * 48px
   */
  lg: string;
  /**
   * 72px
   */
  xl: string;
};

export const spacing: SpacingList = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  default: '16px',
  md: '32px',
  lg: '48px',
  xl: '72px'
};

export type SpacingName = keyof SpacingList;

export const Theme = {
  name: 'Default',
  colors,
  breakpoints: styleBreakpoints,
  spacing
};

export type AppTheme = typeof Theme;
