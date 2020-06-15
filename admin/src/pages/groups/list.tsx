import React from 'react';
import { Card, Typography, Button, Table, Modal } from 'antd';
import { Link } from 'react-router-dom';
import { PageContainer, ActionWrapper } from './styles';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Group } from '../../interfaces/group';
import { useDispatch, useSelector } from 'react-redux';
import { requestGetGroup, requestDeleteGroup } from '../../redux/group/actions';
import { AppState } from '../../redux/rootReducer';

/**
 * Group list component
 * @param props component props
 */
export const GroupList: React.FC<{}> = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(requestGetGroup());
  }, [dispatch]);

  const list = useSelector<AppState, Group[]>(({ groupReducer }) => groupReducer.list);
  const loading = useSelector<AppState, boolean>(({ groupReducer }) => groupReducer.loading);

  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Grupos`}</Typography.Title>}
        extra={
          <Link to={`/grupos/criar`}>
            <Button type="primary">Criar</Button>
          </Link>
        }
      >
        <Table loading={loading} dataSource={list} rowKey="id">
          <Table.Column title="Nome" dataIndex="title" />
          <Table.Column
            render={(item: Group) => {
              return (
                <ActionWrapper>
                  <Link to={`/grupos/${item.id}/editar`}>
                    <Button>Editar</Button>
                  </Link>
                  <Button
                    danger
                    onClick={() =>
                      Modal.confirm({
                        title: 'Você realmente quer deletar esse registro?',
                        icon: <ExclamationCircleOutlined />,
                        okText: 'Sim',
                        okType: 'danger',
                        cancelText: 'Não',
                        onOk: () => {
                          dispatch(requestDeleteGroup(item.id as number));
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
