import React from 'react';
import { useSelector } from 'react-redux';
import { Typography, Card } from 'antd';
import { AppState } from '../../redux/rootReducer';
import { PageContainer } from './styles';
import { User } from '../../interfaces/user';

/**
 * Dashboard page component
 * @param props component props
 */
export const DashboardPage: React.FC<{}> = (props) => {
  // Redux state
  const user = useSelector<AppState, User>((state) => state.authReducer.user as User);
  return (
    <PageContainer>
      <Card>
        <Typography.Text>{`Bem vindo ${user.name}`}</Typography.Text>
      </Card>
    </PageContainer>
  );
};
