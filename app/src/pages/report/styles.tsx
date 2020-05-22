import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: ${(props) => props.theme.spacing.md};
`;

export const PrintableBodyWrapper = styled.div`
  @media print {
    z-index: 9999;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    .no-print,
    .no-print * {
      display: none !important;
    }
  }
`;

export const Th = styled.th`
  text-align: right !important;
`;
