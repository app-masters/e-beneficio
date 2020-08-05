import React, { useMemo, useState } from 'react';
import { Button, Card, Table, Typography, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { User } from '../../../interfaces/user';
import { Family } from '../../../interfaces/family';
import { AppState } from '../../../redux/rootReducer';

import { ActionWrapper, PageContainer } from './styles';
import { Flex } from '../../../components/flex';
import { requestGetFamilies } from '../../../redux/families/actions';

/**
 * FamiliesList page component
 * @param props component props
 */
export const FamiliesList: React.FC<{}> = () => {
  // Redux state
  const list = useSelector<AppState, Family[]>(({ familiesReducer }) => familiesReducer.list as Family[]);
  const loading = useSelector<AppState, boolean>(({ familiesReducer }) => familiesReducer.loading);
  const [selectedNis, setSelectedNis] = useState<string | undefined>();

  const dataSource = useMemo(
    () =>
      selectedNis && selectedNis.length > 1
        ? list.filter((item) => item.responsibleNis && item.responsibleNis.indexOf(selectedNis) > -1)
        : list,
    [list, selectedNis]
  );

  // Redux actions
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(requestGetFamilies());
  }, [dispatch]);

  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Famílias`}</Typography.Title>}
        extra={
          <Flex>
            <Input
              id="selectedNis"
              name="selectedNis"
              onChange={(event) => setSelectedNis(event.target.value)}
              value={selectedNis}
              placeholder="Filtrar NIS"
            />
            <Link style={{ marginLeft: 15 }} to={`/familias/criar`}>
              <Button type="primary">Criar</Button>
            </Link>
          </Flex>
        }
      >
        <Table loading={loading} dataSource={dataSource} rowKey="id">
          <Table.Column title="Nome do responsável" dataIndex="responsibleName" />
          <Table.Column title="NIS do responsável" dataIndex="responsibleNis" />
          <Table.Column title="Número de dependentes" render={(family: Family) => family.dependents?.length || 0} />
          <Table.Column
            title="Data de inclusão"
            render={(family: Family) => moment(family.createdAt as Date).format('DD/MM/YYYY')}
          />
          <Table.Column
            width="10%"
            render={(item: User) => {
              return (
                <ActionWrapper>
                  <Link to={`/familias/${item.id}/info`}>
                    <Button>Visualizar</Button>
                  </Link>
                  <div style={{ width: 10 }} />
                  <Link to={`/familias/${item.id}/editar`}>
                    <Button>Editar</Button>
                  </Link>
                </ActionWrapper>
              );
            }}
          />
        </Table>
      </Card>
    </PageContainer>
  );
};
