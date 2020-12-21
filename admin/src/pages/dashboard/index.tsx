import { Card, Col, Row, Statistic, Typography, Divider } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dashboard } from '../../interfaces/dashboard';
import { User } from '../../interfaces/user';
import { requestGetDashboard } from '../../redux/dashboard/actions';
import { AppState } from '../../redux/rootReducer';
import { PageContainer } from './styles';
import { formatMoney } from '../../utils/string';
import { env } from '../../env';

// Application consumption type
const consumptionType = env.REACT_APP_CONSUMPTION_TYPE as 'ticket' | 'product';

/**
 * Dashboard page component
 * @param props component props
 */
export const DashboardPage: React.FC<{}> = () => {
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
      <Row gutter={[16, 32]}>
        <Col span={24} md={8}>
          <Card>
            <Statistic
              title="Hoje"
              value={formatMoney(dashboard?.todayFamilies, 0)}
              suffix={dashboard?.todayFamilies === 1 ? 'família auxiliada' : 'famílias auxiliadas'}
            />
            {consumptionType !== 'product' && (
              <>
                <Divider />
                <Typography.Text type="secondary">
                  R$ {formatMoney(dashboard?.todayConsumption)} em consumo
                </Typography.Text>
              </>
            )}
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card>
            <Statistic
              title="Últimos 7 dias"
              value={formatMoney(dashboard?.weekFamilies, 0)}
              suffix={dashboard?.weekFamilies === 1 ? 'família auxiliada' : 'famílias auxiliadas'}
            />
            {consumptionType !== 'product' && (
              <>
                <Divider />
                <Typography.Text type="secondary">
                  R$ {formatMoney(dashboard?.weekConsumption)} em consumo
                </Typography.Text>
              </>
            )}
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card>
            <Statistic
              title="Últimos 30 dias"
              value={formatMoney(dashboard?.monthFamilies, 0)}
              suffix={dashboard?.monthFamilies === 1 ? 'família auxiliada' : 'famílias auxiliadas'}
            />
            {consumptionType !== 'product' && (
              <>
                <Divider />
                <Typography.Text type="secondary">
                  R$ {formatMoney(dashboard?.monthConsumption)} em consumo
                </Typography.Text>
              </>
            )}
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24} md={8}>
          <Card>
            <Statistic
              title="Total"
              value={formatMoney(dashboard?.familyCount, 0)}
              suffix={dashboard?.familyCount === 1 ? 'família cadastrada' : 'famílias cadastradas'}
            />
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card>
            <Statistic
              title="Utilização"
              value={formatMoney(dashboard?.familyWithConsumption, 0)}
              suffix={
                dashboard?.familyWithConsumption === 1
                  ? 'família utilizou do auxilio'
                  : 'famílias utilizaram do auxilio'
              }
            />
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card>
            <Statistic
              title="Não utilizado"
              value={formatMoney(dashboard?.familyWithoutConsumption, 0)}
              suffix={
                dashboard?.familyWithoutConsumption === 1
                  ? 'família não utilizou do auxilio'
                  : 'famílias não utilizaram do auxilio'
              }
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24} md={8}>
          <Card>
            <Statistic
              title="Dependentes"
              value={formatMoney(dashboard?.dependentCount, 0)}
              suffix={dashboard?.dependentCount === 1 ? 'dependente cadastrado' : 'dependentes cadastrados'}
            />
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card>
            <Statistic
              title="Consumo"
              value={formatMoney(dashboard?.consumptionCount, 0)}
              suffix={dashboard?.consumptionCount === 1 ? 'nota fiscal declarada' : 'notas fiscais declaradas'}
            />
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card>
            <Statistic
              title="Consumo inválido"
              value={`R$${formatMoney(dashboard?.invalidConsumption, 0)}`}
              suffix={dashboard?.invalidConsumption === 1 ? 'nota fiscal inválidada' : 'notas fiscais inválidadas'}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};
