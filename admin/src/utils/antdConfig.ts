import { ConfigProviderProps } from 'antd/lib/config-provider';
import ptBRLocale from 'antd/es/locale/pt_BR';

export const AntdDefaultConfig: ConfigProviderProps = {
  locale: {
    ...ptBRLocale,
    Empty: {
      description: 'Nenhum item criado'
    }
  }
};
