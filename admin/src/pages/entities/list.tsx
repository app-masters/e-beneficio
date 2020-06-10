import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Table, Typography } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Entity } from '../../interfaces/entity';
import { requestDeleteEntity, requestGetEntity } from '../../redux/entity/actions';
import { AppState } from '../../redux/rootReducer';
import { ActionWrapper, PageContainer } from './styles';

/**
 * List component
 * @param props component props
 */
export const EntityList: React.FC<{}> = () => {
  // Redux state
  const list = useSelector<AppState, Entity[]>(({ entityReducer }) => entityReducer.list as Entity[]);
  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(requestGetEntity());
  }, [dispatch]);
  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Entidades`}</Typography.Title>}
        extra={
          <Link to={`/entidades/criar`}>
            <Button type="primary">Criar</Button>
          </Link>
        }
      >
        <Table dataSource={list}>
          <Table.Column title="Nome" dataIndex="title" />
          <Table.Column
            title="Criado"
            dataIndex="createdAt"
            render={(data: Entity['createdAt']) => moment(data as Date).fromNow()}
          />
          <Table.Column
            render={(item: Entity) => {
              return (
                <ActionWrapper>
                  <Link to={`/entidades/${item.id}/editar`}>
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
                          dispatch(requestDeleteEntity(item.id as number));
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
