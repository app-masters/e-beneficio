import React from 'react';
import { PageContainer } from './styles';
import { List, Card, Row, Col, Typography, Descriptions, Button } from 'antd';
import { AppState } from '../../../redux/rootReducer';
import { useSelector, useDispatch } from 'react-redux';
import { Family } from '../../../interfaces/family';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import moment from 'moment';
import { formatMoney, formatPhone } from '../../../utils/string';
import { requestGetPlaceStore } from '../../../redux/placeStore/actions';
import { requestGetGroup } from '../../../redux/group/actions';
import { PlaceStore } from '../../../interfaces/placeStore';
import { Group } from '../../../interfaces/group';
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
      dispatch(requestGetPlaceStore());
      dispatch(requestGetGroup());
      dispatch(requestGetFamily(undefined, undefined, props.match.params.id));
      dispatch(requestGetConsumptionFamily(props.match.params.id));
    } else {
      history.push('/families');
    }
  }, [history, dispatch, props]);

  const groups = useSelector<AppState, Group[]>(({ groupReducer }) => groupReducer.list as Group[]);
  const placeStore = useSelector<AppState, PlaceStore[]>(
    ({ placeStoreReducer }) => placeStoreReducer.list as PlaceStore[]
  );

  const familyResponsible = React.useMemo(() => {
    return family?.dependents.find((f) => f.isResponsible);
  }, [family]);

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card loading={familyLoading} title={<Typography.Title>Família</Typography.Title>}>
            <Descriptions column={4} layout="vertical">
              <Descriptions.Item label="Código">{family?.code}</Descriptions.Item>
              <Descriptions.Item label="Grupo familiar">
                {groups.find((group) => group.id === family?.groupId)?.title}
              </Descriptions.Item>
              <Descriptions.Item label="Entidade vinculada">
                {placeStore.find((placeStore) => placeStore.id === family?.placeStoreId)?.title}
              </Descriptions.Item>
              <Descriptions.Item label="Criado em">
                {moment(family?.createdAt || '').format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Responsável">{familyResponsible?.name}</Descriptions.Item>
              <Descriptions.Item label="Tipo de casa">{family?.houseType}</Descriptions.Item>
              <Descriptions.Item label="Quantidade de quartos">{family?.numberOfRooms}</Descriptions.Item>
              <Descriptions.Item label="Renda familiar">{`R$ ${formatMoney(family?.totalSalary)}`}</Descriptions.Item>
              <Descriptions.Item label="Endereço" span={2}>
                {family?.address}
              </Descriptions.Item>
              <Descriptions.Item label="Família registrada no Bolsa Família">
                {family?.isOnGovernProgram ? 'Sim' : 'Não'}
              </Descriptions.Item>
              <Descriptions.Item label="Família registrada em outro programa">
                {family?.isOnAnotherProgram ? 'Sim' : 'Não'}
              </Descriptions.Item>
              <Descriptions.Item label="Comentário sobre o esgoto" span={2}>
                {family?.sewageComment}
              </Descriptions.Item>
              <Descriptions.Item label="Possui esgoto">{family?.haveSewage ? 'Sim' : 'Não'}</Descriptions.Item>
              <Descriptions.Item label="Registrado pessoalmente">
                {family?.isRegisteredInPerson ? 'Sim' : 'Não'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card loading={familyLoading} title={<h1>Membros</h1>}>
            <List
              dataSource={family?.dependents || []}
              itemLayout="horizontal"
              locale={{ emptyText: 'Nenhum membro cadastrado' }}
              renderItem={(item) => (
                <List.Item style={{ paddingBottom: 0 }}>
                  <List.Item.Meta
                    title={
                      <>
                        {item.isResponsible ? (
                          <strong>
                            {'Responsável familiar'} <br />
                          </strong>
                        ) : (
                          ''
                        )}
                        {`${item.name} - ${item.isHired === null || item.isHired === undefined ? 'Criança' : 'Adulto'}`}
                      </>
                    }
                    description={
                      <Row gutter={[16, 16]}>
                        <Col span={24} md={12}>
                          <Row>
                            {(item.email || item.phone) && `${item.email || ''} - ${formatPhone(item.phone) || ''}`}
                          </Row>
                          <Row>{(item.cpf || item.rg) && `CPF: ${item.cpf || ''} - RG: ${item.rg || ''}`}</Row>
                          <Row>{item.schoolName && `Escola: ${item.schoolName || ''}`}</Row>
                        </Col>
                        {item.profession && (
                          <Col span={24} md={12}>
                            <Row>{`Profissão: ${item.profession || ''}`}</Row>
                            <Row>{`Salário: ${item.salary ? 'R$ ' + formatMoney(item.salary) : 'Não informado'}`}</Row>
                          </Col>
                        )}
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
                    title={`Consumo registrado em ${moment(item.createdAt || moment()).format('DD/MM/YYYY HH:mm')} - ${
                      item.consumptionProducts?.length
                    } items`}
                    description={`Produtos adquiridos: ${item.consumptionProducts
                      ?.map((item) => `${item.amount} ${item.product.name}`)
                      .join(', ')}`}
                  />
                  <div style={{ paddingLeft: 10 }}>
                    <a href={item?.proofImageUrl || ''} target={'__blank'}>
                      <Button>
                        <CameraOutlined />
                        Mostrar comprovante
                      </Button>
                    </a>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};
