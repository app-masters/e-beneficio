import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Row, Col, Statistic, Divider, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { AppState } from '../../redux/rootReducer';
import { PageContainer, ActionContainer } from './styles';
import { User } from '../../interfaces/user';
import { FamilySearch } from '../../components/familySearch';
import { spacing } from '../../styles/theme';
import { Dashboard } from '../../interfaces/dashboard';
import { requestGetDashboard } from '../../redux/dashboard/actions';

/**
 * Dashboard page component
 * @param props component props
 */
export const DashboardPage: React.FC<{}> = (props) => {
  // Redux state
  const user = useSelector<AppState, User | undefined>((state) => state.authReducer.user);
  const dashboard = useSelector<AppState, Dashboard | undefined>((state) => state.dashboardReducer.dashboard);

  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(requestGetDashboard());
  }, [dispatch]);
  return (
    <PageContainer>
      <Card style={{ marginBottom: spacing.default }} title={`Bem vindo ${user?.name}`}>
        <ActionContainer>
          <Button type="primary" size="large">
            <Link to="/consumo">Informar novo consumo</Link>
          </Button>
        </ActionContainer>
      </Card>
      <Card title="Consultar saldo" style={{ marginBottom: spacing.default }}>
        <FamilySearch />
      </Card>
      {user?.role === 'manager' && (
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic title="Famílias auxiliadas no mês" value={dashboard?.monthFamilies} />
              <Divider />
              <Typography.Text type="secondary">Hoje: </Typography.Text>
              <Typography.Text type="secondary">
                {dashboard?.todayFamilies} {dashboard?.todayFamilies === 1 ? 'família' : 'famílias'}
              </Typography.Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Consumo total no mês"
                value={dashboard?.monthConsumption}
                prefix="R$"
                decimalSeparator=","
              />
              <Divider />
              <Typography.Text type="secondary">Hoje: </Typography.Text>
              <Typography.Text type="secondary">
                R$ {dashboard?.todayConsumption.toFixed(2).replace('.', ',')}
              </Typography.Text>
            </Card>
          </Col>
        </Row>
      )}
    </PageContainer>
  );
};
