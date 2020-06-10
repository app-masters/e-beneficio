import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Table, Typography, Spin } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Locality } from '../../interfaces/locality';
import { requestDeleteLocality, requestGetLocality } from '../../redux/locality/actions';
import { AppState } from '../../redux/rootReducer';
import { ActionWrapper, PageContainer } from './styles';
import { formatCNPJ } from '../../utils/string';
import { Entity } from '../../interfaces/entity';
import { requestGetEntity } from '../../redux/entity/actions';

/**
 * List component
 * @param props component props
 */
export const LocalityList: React.FC<{}> = () => {
  // Redux state
  const list = useSelector<AppState, Locality[]>(({ localityReducer }) => localityReducer.list as Locality[]);
  const entityLoading = useSelector<AppState, boolean>(({ entityReducer }) => entityReducer.loading);
  const entityList = useSelector<AppState, Entity[]>(({ entityReducer }) => entityReducer.list);
  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    if (!entityList || entityList.length <= 0) {
      dispatch(requestGetEntity());
    }
    dispatch(requestGetLocality());
  }, [dispatch, entityList]);
  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Localidades`}</Typography.Title>}
        extra={
          <Link to={`/localidades/criar`}>
            <Button type="primary">Criar</Button>
          </Link>
        }
      >
        <Table dataSource={list}>
          <Table.Column
            title="Entidade"
            dataIndex="placeId"
            render={(data: Locality['placeId']) =>
              entityLoading || !entityList || entityList.length <= 0 ? (
                <Spin size="small" />
              ) : (
                entityList.find((entity) => entity.id === data)?.title
              )
            }
          />
          <Table.Column title="Loja" dataIndex="title" />
          <Table.Column title="CNPJ" dataIndex="cnpj" render={(data: Locality['cnpj']) => formatCNPJ(data)} />
          <Table.Column title="Endereço" dataIndex="address" />
          <Table.Column
            render={(item: Locality) => {
              return (
                <ActionWrapper>
                  <Link to={`/localidades/${item.id}/editar`}>
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
                          dispatch(requestDeleteLocality(item.id as number));
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
