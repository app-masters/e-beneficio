import styled from 'styled-components';

export const LogoWrapper = styled.div<{ collapsed?: boolean }>`
  max-width: 100%;
  position: relative;
  height: ${(props) => (props.collapsed ? `80px` : `229px`)};
  transition: height 200ms ease-out;
`;

export const Logo = styled.img<{ show?: boolean }>`
  position: absolute;
  padding: ${(props) => props.theme.spacing.default};
  max-width: 100%;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: ${(props) => (props.show ? `1` : `0`)};
  transition: opacity 30ms;
`;

export const MenuIcon = styled.span`
  z-index: 2;
  color: #fff;
  font-size: 16px;
  position: absolute;
  top: ${(props) => props.theme.spacing.md};
  right: -16px;
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  background-color: ${(props) => props.theme.colors['@primary-color']};
  border-radius: 50%;
  box-shadow: ${(props) => props.theme.colors['@box-shadow-base']};
  cursor: pointer;
`;

export const FixSider = styled.div`
  > * {
    height: 100%;
    .ant-layout-sider-children {
      display: flex;
      flex-direction: column;
      max-height: 100%;

      > * {
        &:last-child {
          margin-top: auto;
        }
      }
    }
  }
`;

export const MenuHeight = styled.div`
  overflow: auto;
`;
