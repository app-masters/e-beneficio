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
export const DashboardPage: React.FC<{}> = () => {
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
          <Col span={24} md={8}>
            <Card>
              <Statistic
                title="Hoje"
                value={dashboard?.todayFamilies}
                suffix={dashboard?.todayFamilies === 1 ? 'família auxiliada' : 'famílias auxiliadas'}
              />
              <Divider />
              <Typography.Text type="secondary">
                R$ {dashboard?.todayConsumption.toFixed(2).replace('.', ',')} em consumo
              </Typography.Text>
            </Card>
          </Col>
          <Col span={24} md={8}>
            <Card>
              <Statistic
                title="Últimos 7 dias"
                value={dashboard?.weekFamilies}
                suffix={dashboard?.weekFamilies === 1 ? 'família auxiliada' : 'famílias auxiliadas'}
              />
              <Divider />
              <Typography.Text type="secondary">
                R$ {dashboard?.weekConsumption.toFixed(2).replace('.', ',')} em consumo
              </Typography.Text>
            </Card>
          </Col>
          <Col span={24} md={8}>
            <Card>
              <Statistic
                title="Últimos 30 dias"
                value={dashboard?.monthFamilies}
                suffix={dashboard?.monthFamilies === 1 ? 'família auxiliada' : 'famílias auxiliadas'}
              />
              <Divider />
              <Typography.Text type="secondary">
                R$ {dashboard?.monthConsumption.toFixed(2).replace('.', ',')} em consumo
              </Typography.Text>
            </Card>
          </Col>
        </Row>
      )}
    </PageContainer>
  );
};
