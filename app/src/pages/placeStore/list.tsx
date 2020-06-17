import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Table, Typography, Spin } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { PlaceStore } from '../../interfaces/placeStore';
import { requestDeletePlaceStore, requestGetPlaceStore } from '../../redux/placeStore/actions';
import { AppState } from '../../redux/rootReducer';
import { ActionWrapper, PageContainer } from './styles';
import { formatCNPJ } from '../../utils/string';
import { Place } from '../../interfaces/place';
import { requestGetPlace } from '../../redux/place/actions';
import EmptyList from '../../components/emptyList';

/**
 * List component
 * @param props component props
 */
export const PlaceStoreList: React.FC<{}> = () => {
  // Redux state
  const list = useSelector<AppState, PlaceStore[]>((state) => state.placeStoreReducer.list as PlaceStore[]);
  const placeLoading = useSelector<AppState, boolean>(({ placeReducer }) => placeReducer.loading);
  const placeList = useSelector<AppState, Place[]>(({ placeReducer }) => placeReducer.list);
  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    if (!placeList || placeList.length <= 0) {
      dispatch(requestGetPlace());
    }

    dispatch(requestGetPlaceStore());
  }, [dispatch, placeList]);
  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Lojas`}</Typography.Title>}
        extra={
          <Link to={`/lojas/criar`}>
            <Button type="primary">Criar</Button>
          </Link>
        }
      >
        <Table
          locale={{
            emptyText: () => <EmptyList title={'Nenhuma loja disponível'} />
          }}
          dataSource={list}
        >
          <Table.Column
            title="Estabelecimento"
            dataIndex="placeId"
            render={(data: PlaceStore['placeId']) =>
              placeLoading || !placeList || placeList.length <= 0 ? (
                <Spin size="small" />
              ) : (
                placeList.find((place) => place.id === data)?.title
              )
            }
          />
          <Table.Column title="Loja" dataIndex="title" />
          <Table.Column title="CNPJ" dataIndex="cnpj" render={(data: PlaceStore['cnpj']) => formatCNPJ(data)} />
          <Table.Column title="Endereço" dataIndex="address" />
          <Table.Column
            render={(item: PlaceStore) => {
              return (
                <ActionWrapper>
                  <Link to={`/lojas/${item.id}/editar`}>
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
                          dispatch(requestDeletePlaceStore(item.id as number));
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
