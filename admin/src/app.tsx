import React, { useEffect } from 'react';
import moment from 'moment';
import momentBR from 'moment/locale/pt-br';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/globalStyles';
import { Theme } from './styles/theme';

/**
 * Base React application component
 */
const App = () => {
  useEffect(() => {
    moment.updateLocale('pt-br', momentBR);
  }, []);
  return (
    <ThemeProvider theme={Theme}>
      <GlobalStyles />
      <h1>Welcome</h1>
    </ThemeProvider>
  );
};

export default App;
