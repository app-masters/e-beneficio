import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { Typography, Table, Card, Button } from 'antd';
import { AppState } from '../../redux/rootReducer';
import { PageContainer, ActionWrapper } from './styles';
import { Place } from '../../interfaces/place';
import { requestGetPlace } from '../../redux/place/actions';

/**
 * List component
 * @param props component props
 */
export const PlaceList: React.FC<{}> = (props) => {
  const history = useHistory();
  // Redux state
  const list = useSelector<AppState, Place[]>((state) => state.placeReducer.list as Place[]);
  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(requestGetPlace());
  }, []);
  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Estabelecimentos`}</Typography.Title>}
        extra={<Button type="primary">Criar</Button>}
      >
        <Table dataSource={list}>
          <Table.Column title="Nome" dataIndex="title" />
          <Table.Column
            title="Criado"
            dataIndex="createdAt"
            render={(data: Place['createdAt']) => moment(data as Date).fromNow()}
          />
          <Table.Column
            render={(item: Place) => (
              <ActionWrapper>
                <Button onClick={() => history.push(`/estabelecimentos/${item.id}/editar`)}>Editar</Button>
                <Button danger>Excluir</Button>
              </ActionWrapper>
            )}
          />
        </Table>
      </Card>
    </PageContainer>
  );
};
