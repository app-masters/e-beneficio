import React, { useEffect } from 'react';
import { ActionWrapper, PageContainer } from './styles';
import { Button, Card, Modal, Spin, Table, Tag, Typography } from 'antd';
import { User } from '../../interfaces/user';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/rootReducer';
import { PlaceStore } from '../../interfaces/placeStore';
import { requestGetPlaceStore } from '../../redux/placeStore/actions';
import { requestDeleteUser, requestGetUser } from '../../redux/user/actions';
import { formatCPF } from '../../utils/string';
import { roleList } from './../../utils/constraints';
import EmptyList from '../../components/emptyList';

/**
 * UserList page component
 * @param props component props
 */
export const UserList: React.FC<{}> = () => {
  // Redux state
  const currentUser = useSelector<AppState, User>((state) => state.authReducer.user as User);
  const list = useSelector<AppState, User[]>((state) => state.userReducer.list as User[]);
  const placeStoreLoading = useSelector<AppState, boolean>(({ placeStoreReducer }) => placeStoreReducer.loading);
  const placeStoreList = useSelector<AppState, PlaceStore[]>(({ placeStoreReducer }) => placeStoreReducer.list);
  // Redux actions
  const dispatch = useDispatch();

  useEffect(() => {
    if (!placeStoreList || placeStoreList.length <= 0) {
      dispatch(requestGetPlaceStore());
    }
    dispatch(requestGetUser());
  }, [dispatch, placeStoreList]);

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
        <Table
          locale={{
            emptyText: () => <EmptyList title={'Nenhum usuário disponível'} />
          }}
          dataSource={list}
        >
          <Table.Column title="Nome" dataIndex="name" />
          <Table.Column title="Email" dataIndex="email" />
          <Table.Column
            title="Ativo"
            dataIndex="active"
            render={(active: User['active']) => <Tag>{active ? 'Ativo' : 'Inativo'}</Tag>}
          />
          <Table.Column title="CPF" dataIndex="cpf" render={(data: User['cpf']) => formatCPF(data)} />
          <Table.Column title="Função" dataIndex="role" render={(data: User['role']) => roleList[data]?.title || data} />
          <Table.Column
            title="Loja"
            dataIndex="placeStoreId"
            render={(data: User['placeStoreId']) =>
              placeStoreLoading || !placeStoreList || placeStoreList.length <= 0 ? (
                <Spin size="small" />
              ) : (
                placeStoreList.find((place) => place.id === data)?.title
              )
            }
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
                    onClick={() => {
                      if (item.id === currentUser.id) {
                        Modal.error({
                          title: 'Você não pode apagar este registro!'
                        });
                      } else {
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
                        });
                      }
                    }}
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
