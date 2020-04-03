import React, { useEffect } from 'react';
import moment from 'moment';
import momentBR from 'moment/locale/pt-br';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';

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
      <Provider store={{}}>
        <h1>Welcome</h1>
      </Provider>
    </ThemeProvider>
  );
};

export default App;
