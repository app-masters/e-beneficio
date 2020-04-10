import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Button } from 'antd';
import { Link } from 'react-router-dom';
import { AppState } from '../../redux/rootReducer';
import { PageContainer, ActionContainer } from './styles';
import { User } from '../../interfaces/user';
import { FamilySearch } from '../../components/familySearch';
import { spacing } from '../../styles/theme';

/**
 * Dashboard page component
 * @param props component props
 */
export const DashboardPage: React.FC<{}> = (props) => {
  // Redux state
  const user = useSelector<AppState, User>((state) => state.authReducer.user as User);
  return (
    <PageContainer>
      <Card style={{ marginBottom: spacing.default }} title={`Bem vindo ${user.name}`}>
        <ActionContainer>
          <Button type="primary" size="large">
            <Link to="/consumo">Informar novo consumo</Link>
          </Button>
        </ActionContainer>
      </Card>
      <Card title="Consultar saldo" style={{ marginBottom: spacing.default }}>
        <FamilySearch />
      </Card>
    </PageContainer>
  );
};
