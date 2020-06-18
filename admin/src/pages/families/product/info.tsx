import React from 'react';
import { PageContainer } from './styles';
import { List, Card, Row, Col, Typography, Descriptions } from 'antd';
import { AppState } from '../../../redux/rootReducer';
import { useSelector, useDispatch } from 'react-redux';
import { Family } from '../../../interfaces/family';
import { RouteComponentProps } from 'react-router-dom';
import moment from 'moment';
import { formatMoney, formatPhone } from '../../../utils/string';
import { requestGetPlaceStore } from '../../../redux/placeStore/actions';
import { requestGetGroup } from '../../../redux/group/actions';
import { PlaceStore } from '../../../interfaces/placeStore';
import { Group } from '../../../interfaces/group';
import { Dependent } from '../../../interfaces/dependent';

const familyMock = {
  id: 86,
  cityId: 1,
  code: '4MUZTK',
  groupId: 6,
  address: 'Não lembro Não lembro Não lembro Não lembro Não lembro Não lembro',
  deactivatedAt: null,
  isRegisteredInPerson: true,
  totalSalary: 2000,
  isOnAnotherProgram: true,
  isOnGovernProgram: true,
  houseType: 'Residencia',
  numberOfRooms: 4,
  haveSewage: true,
  sewageComment: 'Tem esgoto',
  placeStoreId: 2,
  createdById: 1,
  createdAt: '2020-06-18T16:38:20.543Z',
  updatedAt: '2020-06-18T16:38:20.561Z',
  dependents: [
    {
      id: 119,
      familyId: 86,
      name: 'Alessandro Macanha',
      nis: null,
      birthday: '2020-06-09T16:37:53.386Z',
      schoolName: null,
      deactivatedAt: null,
      rg: '11.111.111-11',
      cpf: '111.111.111-111',
      phone: '32988969070',
      profession: 'Programador',
      isHired: true,
      isFormal: true,
      salary: 2000,
      email: 'alessandromacanha@gmail.com',
      isResponsible: true,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate()
    },
    {
      id: 120,
      familyId: 86,
      name: 'Alex Sander',
      nis: null,
      birthday: '2020-06-16T16:37:46.754Z',
      schoolName: null,
      deactivatedAt: null,
      rg: '29.654.847-4',
      cpf: null,
      phone: null,
      profession: null,
      isHired: null,
      isFormal: null,
      salary: null,
      email: null,
      isResponsible: false,
      createdAt: moment().toDate(),
      updatedAt: moment().toDate()
    }
  ],
  balance: [],
  responsibleDependent: {
    id: 119,
    familyId: 86,
    name: 'Alessandro Macanha',
    nis: null,
    birthday: '2020-06-09T16:37:53.386Z',
    schoolName: null,
    deactivatedAt: null,
    rg: '11.111.111-11',
    cpf: '111.111.111-111',
    phone: '32988969070',
    profession: 'Programador',
    isHired: true,
    isFormal: true,
    salary: 2000,
    email: 'alessandromacanha@gmail.com',
    isResponsible: true,
    createdAt: moment().toDate(),
    updatedAt: moment().toDate()
  }
};
/**
 * Families Info page
 */
export const FamiliesInfo: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const family = familyMock;

  // Redux actions
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(requestGetPlaceStore());
    dispatch(requestGetGroup());
  }, [dispatch]);

  const groups = useSelector<AppState, Group[]>(({ groupReducer }) => groupReducer.list as Group[]);
  const placeStore = useSelector<AppState, PlaceStore[]>(
    ({ placeStoreReducer }) => placeStoreReducer.list as PlaceStore[]
  );

  const familyResponsible = React.useMemo(() => {
    return family.responsibleDependent;
  }, [family]);

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={<Typography.Title>Família</Typography.Title>}>
            <Descriptions column={4} layout="vertical">
              <Descriptions.Item label="Código">{family.code}</Descriptions.Item>
              <Descriptions.Item label="Grupo familiar">
                {groups.find((group) => group.id === family.groupId)?.title}
              </Descriptions.Item>
              <Descriptions.Item label="Entidade vinculada">
                {placeStore.find((placeStore) => placeStore.id === family.placeStoreId)?.title}
              </Descriptions.Item>
              <Descriptions.Item label="Criado em">{moment(family?.createdAt).format('DD/MM/YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Responsável">{familyResponsible?.name}</Descriptions.Item>
              <Descriptions.Item label="Tipo de casa">{family.houseType}</Descriptions.Item>
              <Descriptions.Item label="Quantidade de quartos">{family.numberOfRooms}</Descriptions.Item>
              <Descriptions.Item label="Renda familiar">{`R$ ${formatMoney(family.totalSalary)}`}</Descriptions.Item>
              <Descriptions.Item label="Endereço" span={2}>
                {family.address}
              </Descriptions.Item>
              <Descriptions.Item label="Família registrada no Bolsa Família">
                {family.isOnGovernProgram ? 'Sim' : 'Não'}
              </Descriptions.Item>
              <Descriptions.Item label="Família registrada em outro programa">
                {family.isOnAnotherProgram ? 'Sim' : 'Não'}
              </Descriptions.Item>
              <Descriptions.Item label="Comentário sobre o esgoto" span={2}>
                {family.sewageComment}
              </Descriptions.Item>
              <Descriptions.Item label="Possui esgoto">{family.haveSewage ? 'Sim' : 'Não'}</Descriptions.Item>
              <Descriptions.Item label="Registrado pessoalmente">
                {family.isRegisteredInPerson ? 'Sim' : 'Não'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={<h1>Membros</h1>}>
            <List
              dataSource={family.dependents || []}
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
          <Card title={<h1>Histórico de consumo</h1>}></Card>
        </Col>
      </Row>
    </PageContainer>
  );
};
