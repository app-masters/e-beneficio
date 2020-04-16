import { Card, Col, Row, Statistic, Typography, Divider } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dashboard } from '../../interfaces/dashboard';
import { User } from '../../interfaces/user';
import { requestGetDashboard } from '../../redux/dashboard/actions';
import { AppState } from '../../redux/rootReducer';
import { PageContainer } from './styles';

/**
 * Dashboard page component
 * @param props component props
 */
export const DashboardPage: React.FC<{}> = (props) => {
  // Redux state
  const user = useSelector<AppState, User>((state) => state.authReducer.user as User);
  const dashboard = useSelector<AppState, Dashboard | undefined>((state) => state.dashboardReducer.dashboard);

  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(requestGetDashboard());
  }, [dispatch]);
  return (
    <PageContainer>
      <Card style={{ marginBottom: '16px' }}>
        <Typography.Text>{`Bem vindo ${user.name}`}</Typography.Text>
      </Card>
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
    </PageContainer>
  );
};
