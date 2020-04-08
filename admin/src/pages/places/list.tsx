import React, { useEffect } from 'react';
import { Button, Card, Table, Typography } from 'antd';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Place } from '../../interfaces/place';
import { requestGetPlace, requestDeletePlace } from '../../redux/place/actions';
import { AppState } from '../../redux/rootReducer';
import { ActionWrapper, PageContainer } from './styles';

/**
 * List component
 * @param props component props
 */
export const PlaceList: React.FC<{}> = (props) => {
  // Redux state
  const list = useSelector<AppState, Place[]>((state) => state.placeReducer.list as Place[]);
  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(requestGetPlace());
  }, [dispatch]);
  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Estabelecimentos`}</Typography.Title>}
        extra={
          <Link to={`/estabelecimentos/criar`}>
            <Button type="primary">Criar</Button>
          </Link>
        }
      >
        <Table dataSource={list}>
          <Table.Column title="Nome" dataIndex="title" />
          <Table.Column
            title="Criado"
            dataIndex="createdAt"
            render={(data: Place['createdAt']) => moment(data as Date).fromNow()}
          />
          <Table.Column
            render={(item: Place) => {
              return (
                <ActionWrapper>
                  <Link to={`/estabelecimentos/${item.id}/editar`}>
                    <Button>Editar</Button>
                  </Link>
                  {/* TODO: Add alert on delete */}
                  <Button danger onClick={() => dispatch(requestDeletePlace(item.id as number))}>
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
