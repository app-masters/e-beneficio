import React from 'react';
import { PageContainer } from './styles';
import { List, Card, Row, Col, Typography, Descriptions, Button } from 'antd';
import { AppState } from '../../../redux/rootReducer';
import { useSelector, useDispatch } from 'react-redux';
import { Family } from '../../../interfaces/family';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import moment from 'moment';
import { formatMoney } from '../../../utils/string';
import { requestGetConsumptionFamily } from '../../../redux/consumption/actions';
import { Consumption } from '../../../interfaces/consumption';
import { CameraOutlined } from '@ant-design/icons';
import { requestGetFamily } from '../../../redux/families/actions';

/**
 * Families Info page
 */
export const FamiliesInfo: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const family = useSelector<AppState, Family | undefined>(({ familiesReducer }) =>
    familiesReducer?.list?.find((f) => f.id === Number(props.match.params.id))
  );

  const familyLoading = useSelector<AppState, boolean>(({ familiesReducer }) => familiesReducer?.loading);
  const consumption = useSelector<AppState, Consumption[]>(
    ({ consumptionReducer }) => consumptionReducer.list as Consumption[]
  );
  const consumptionLoading = useSelector<AppState, boolean>(({ consumptionReducer }) => consumptionReducer.loading);

  // Redux actions
  const dispatch = useDispatch();
  const history = useHistory();

  React.useEffect(() => {
    if (props.match.params.id) {
      dispatch(requestGetFamily(undefined, undefined, props.match.params.id));
      dispatch(requestGetConsumptionFamily(props.match.params.id));
    } else {
      history.push('/families/list');
    }
  }, [history, dispatch, props]);

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card loading={familyLoading} title={<Typography.Title>Família</Typography.Title>}>
            <Descriptions column={4} layout="vertical">
              <Descriptions.Item label="NIS do responsável">{family?.responsibleNis}</Descriptions.Item>
              <Descriptions.Item label="Nome do responsável">{family?.responsibleName}</Descriptions.Item>
              <Descriptions.Item label="Incluido em">
                {moment(family?.createdAt || '').format('DD/MM/YYYY')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card loading={familyLoading} title={<h1>Dependentes</h1>}>
            <List
              dataSource={family?.dependents || []}
              itemLayout="horizontal"
              locale={{ emptyText: 'Nenhum membro cadastrado' }}
              renderItem={(item) => (
                <List.Item style={{ paddingBottom: 0 }}>
                  <List.Item.Meta
                    title={<>{`${item.name}`}</>}
                    description={
                      <Row gutter={[16, 16]}>
                        <Col span={24} md={12}>
                          <Row>{item.nis && `NIS: ${item.nis || ''}`}</Row>
                          <Row>{item.schoolName && `Escola: ${item.schoolName || ''}`}</Row>
                        </Col>
                      </Row>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card bodyStyle={{ paddingTop: 5 }} title={<h1>Histórico de consumo</h1>}>
            <List
              loading={consumptionLoading}
              locale={{ emptyText: 'Nenhum consumo cadastrado' }}
              dataSource={consumption || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={`Consumo informado em ${moment(item.createdAt || moment()).format('DD/MM/YYYY HH:mm')}`}
                    description={`Valor total: R$${formatMoney(item.value)} - Valor inválido: R$${formatMoney(
                      item.invalidValue
                    )}`}
                  />

                  {item?.proofImageUrl && (
                    <div style={{ paddingLeft: 10 }}>
                      <a href={item?.proofImageUrl || ''} target={'__blank'}>
                        <Button>
                          <CameraOutlined />
                          Mostrar comprovante
                        </Button>
                      </a>
                    </div>
                  )}
                  {item?.nfce && (
                    <div style={{ paddingLeft: 10 }}>
                      <a href={item?.nfce || ''} target={'__blank'}>
                        <Button>
                          <CameraOutlined />
                          Mostrar nota fiscal
                        </Button>
                      </a>
                    </div>
                  )}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};
