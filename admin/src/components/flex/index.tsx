import styled from 'styled-components';
import * as CSSTypes from 'csstype';
import { SpacingName } from '../../styles/theme';

type FlexProps = {
  /**
   * Set the flex's align-items css property
   *
   * @default initial
   **/
  alignItems?: CSSTypes.AlignItemsProperty;
  /**
   * Set the flex's justify-content css property
   *
   * @default initial
   **/
  justifyContent?: CSSTypes.JustifyContentProperty;
  /**
   * Whether or not the elements should be vertically stacked.
   * Set the flex's justify-content css property to "column" if true
   **/
  vertical?: boolean;
  /**
   * Add a space between elements
   * If a boolean is given instead of a SpacingName. Defaults to "sm"
   **/
  gap?: SpacingName | boolean;
  /**
   * Set the width AND height to 100%;
   **/
  full?: boolean;
};

/**
 * A div with flexbox properties
 */
export const Flex = styled.div<FlexProps>`
  /* Important !!!!!
  It is not recommended to add more properties here.
  If that is the case, it's better that you create your own
  flex component for your specific case instead. */
  display: flex;
  align-items: ${(props) => (props.alignItems ? props.alignItems : 'initial')};
  justify-content: ${(props) => (props.justifyContent ? props.justifyContent : 'initial')};
  flex-direction: ${(props) => (props.vertical ? 'column' : 'row')};
  ${(props) => (props.full ? 'width: 100%; height: 100%;' : '')}

  /* For every element inside this component, but only the first nested */
  > * {
    /* If not the last one */
    &:not(:last-child) {
      ${(props) =>
        props.gap
          ? `${props.vertical ? 'margin-bottom' : 'margin-right'}: ${
              props.gap === true ? props.theme.spacing.sm : props.theme.spacing[props.gap]
            };`
          : ''}
    }
  }
`;
