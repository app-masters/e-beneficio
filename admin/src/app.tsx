import React, { useEffect } from 'react';
import moment from 'moment';
import momentBR from 'moment/locale/pt-br';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider } from 'antd';

import { GlobalStyles } from './styles/globalStyles';
import { Theme } from './styles/theme';
import getStore from './redux/store';

import { Router } from './pages';

import 'antd/dist/antd.css';
import { AntdDefaultConfig } from './utils/antdConfig';

/**
 * Base React application component
 */
const App = () => {
  useEffect(() => {
    moment.updateLocale('pt-br', momentBR);
  }, []);
  const { store, persistor } = getStore();
  return (
    <ThemeProvider theme={Theme}>
      <ConfigProvider {...AntdDefaultConfig}>
        <GlobalStyles />
        <Provider store={store}>
          <PersistGate persistor={persistor} loading={null}>
            <Router />
          </PersistGate>
        </Provider>
      </ConfigProvider>
    </ThemeProvider>
  );
};

export default App;
