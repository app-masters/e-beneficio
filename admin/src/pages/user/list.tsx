import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Spin, Table, Tag, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Place } from '../../interfaces/place';
import { PlaceStore } from '../../interfaces/placeStore';
import { User } from '../../interfaces/user';
import { requestGetPlace } from '../../redux/place/actions';
import { requestGetPlaceStore } from '../../redux/placeStore/actions';
import { AppState } from '../../redux/rootReducer';
import { requestDeleteUser, requestGetUser } from '../../redux/user/actions';
import { formatCPF } from '../../utils/string';
import { roleList } from './../../utils/constraints';
import { ActionWrapper, PageContainer } from './styles';

/**
 * List component
 * @param props component props
 */
export const UserList: React.FC<{}> = () => {
  // Redux state
  const list = useSelector<AppState, User[]>((state) => state.userReducer.list as User[]);
  const placeStoreLoading = useSelector<AppState, boolean>(({ placeStoreReducer }) => placeStoreReducer.loading);
  const placeStoreList = useSelector<AppState, PlaceStore[]>(({ placeStoreReducer }) => placeStoreReducer.list);
  const placeList = useSelector<AppState, Place[]>(({ placeReducer }) => placeReducer.list);
  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    if (!placeStoreList || placeStoreList.length <= 0) {
      dispatch(requestGetPlaceStore());
    }

    if (!placeList || placeList.length <= 0) {
      dispatch(requestGetPlace());
    }

    dispatch(requestGetUser());
  }, [dispatch, placeStoreList, placeList]);
  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Usuários`}</Typography.Title>}
        extra={
          <Link to={`/usuarios/criar`}>
            <Button type="primary">Criar</Button>
          </Link>
        }
      >
        <Table dataSource={list}>
          <Table.Column title="Nome" dataIndex="name" />
          <Table.Column title="Email" dataIndex="email" />
          <Table.Column
            title="Ativo"
            dataIndex="active"
            render={(active: User['active']) => <Tag>{active ? 'Ativo' : 'Inativo'}</Tag>}
          />
          <Table.Column title="CPF" dataIndex="cpf" render={(data: User['cpf']) => formatCPF(data)} />
          <Table.Column title="Cargo" dataIndex="role" render={(data: User['role']) => roleList[data]?.title || data} />
          <Table.Column
            title="Loja"
            dataIndex="placeStoreId"
            render={(data: User['placeStoreId']) => {
              if (placeStoreLoading || !placeStoreList || placeStoreList.length <= 0) {
                return <Spin size="small" />;
              } else {
                const placeStore = placeStoreList.find((place) => place.id === data);
                if (placeStore) {
                  let val = placeStore.title;

                  if (placeList && placeList.length > 0) {
                    val = `${placeList.find((place) => place.id === placeStore.placeId)?.title} - ${val}`;
                  }

                  return val;
                } else {
                  return null;
                }
              }
            }}
          />
          <Table.Column
            render={(item: User) => {
              return (
                <ActionWrapper>
                  <Link to={`/usuarios/${item.id}/editar`}>
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
                          dispatch(requestDeleteUser(item.id as number));
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
