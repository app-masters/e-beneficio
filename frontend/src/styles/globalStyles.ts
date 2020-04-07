import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  html, #root {
    width: 100%;
    height: 100%;
    background-color: ${(props) => props.theme.colors.background};
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
  }

  #root {
    > * {      
      &:first-child, [role~="group"], [tabindex="-1"] {
        height: 100%;
      }
    }
  }

  body {
    width: 100%;
    height: 100%;    
    overflow-x: hidden;
  }
`;
