import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Table, Typography } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Institution } from '../../interfaces/institution';
import { requestDeleteInstitution, requestGetInstitution } from '../../redux/institution/actions';
import { AppState } from '../../redux/rootReducer';
import { ActionWrapper, PageContainer } from './styles';
import { env } from '../../env';

// Application consumption type
const consumptionType = env.REACT_APP_CONSUMPTION_TYPE as 'ticket' | 'product';

/**
 * List component
 * @param props component props
 */
export const InstitutionList: React.FC<{}> = () => {
  const pageTitle = consumptionType !== 'product' ? 'Instituições' : 'Origem do benefício';
  const path = consumptionType !== 'product' ? 'instituicoes' : 'origem-do-beneficio';

  // Redux state
  const list = useSelector<AppState, Institution[]>((state) => state.institutionReducer.list as Institution[]);
  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(requestGetInstitution());
  }, [dispatch]);
  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{pageTitle}</Typography.Title>}
        extra={
          <Link to={`/${path}/criar`}>
            <Button type="primary">Criar</Button>
          </Link>
        }
      >
        <Table dataSource={list}>
          <Table.Column title="Nome" dataIndex="title" />
          <Table.Column
            title="Criado"
            dataIndex="createdAt"
            render={(data: Institution['createdAt']) => moment(data as Date).fromNow()}
          />
          <Table.Column
            render={(item: Institution) => {
              return (
                <ActionWrapper>
                  <Link to={`/${path}/${item.id}/editar`}>
                    <Button>Editar</Button>
                  </Link>
                  {/* TODO: Add alert on delete */}
                  <Button
                    danger
                    onClick={() =>
                      Modal.confirm({
                        title: 'Você realmente quer deletar esse registro?',
                        icon: <ExclamationCircleOutlined />,
                        // content: 'Some descriptions',
                        okText: 'Sim',
                        okType: 'danger',
                        cancelText: 'Não',
                        onOk: () => {
                          dispatch(requestDeleteInstitution(item.id as number));
                        }
                      })
                    }
                  >
                    Excluir
                  </Button>
                </ActionWrapper>
              );
            }}
          />
        </Table>
      </Card>
    </PageContainer>
  );
};
