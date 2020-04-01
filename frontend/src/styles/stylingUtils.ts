import { ThemeProps, ThemeContext } from 'styled-components';
import { useContext } from 'react';
import { AppTheme } from './theme';

/**
 * Return the default media query for TabletAndUp resolutions
 * @param props Styled components default props
 */
export const TabletAndUp = (props: ThemeProps<AppTheme>) => `@media (min-width: ${props.theme.breakpoints.sm})`;

/**
 * Return the default media query for LaptopAndUp resolutions
 * @param props Styled components default props
 */
export const LaptopAndUp = (props: ThemeProps<AppTheme>) => `@media (min-width: ${props.theme.breakpoints.lg})`;

/**
 * Return the default media query for DesktopAndUp resolutions
 * @param props Styled components default props
 */
export const DesktopAndUp = (props: ThemeProps<AppTheme>) => `@media (min-width: ${props.theme.breakpoints.xl})`;

/**
 * Return the default media query for TabletAndDown resolutions
 * @param props Styled components default props
 */
export const TabletAndDown = (props: ThemeProps<AppTheme>) => `@media (max-width: ${props.theme.breakpoints.lg})`;

/**
 * Return the default media query for LaptopAndDown resolutions
 * @param props Styled components default props
 */
export const LaptopAndDown = (props: ThemeProps<AppTheme>) => `@media (max-width: ${props.theme.breakpoints.xl})`;

/**
 * A hook used to get the styled component's theme property
 */
export const useTheme = () => useContext(ThemeContext);
