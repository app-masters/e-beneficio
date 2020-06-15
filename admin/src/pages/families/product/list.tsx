import React, { useEffect, useMemo } from 'react';
import { Button, Card, Table, Typography, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { User } from '../../../interfaces/user';
import { Family } from '../../../interfaces/family';
import { AppState } from '../../../redux/rootReducer';
import { requestGetPlaceFamilies } from '../../../redux/families/actions';

import { ActionWrapper, PageContainer } from './styles';
import { Dependent } from '../../../interfaces/dependent';
import { requestGetPlaceStore } from '../../../redux/placeStore/actions';
import { PlaceStore } from '../../../interfaces/placeStore';

/**
 * FamiliesList page component
 * @param props component props
 */
export const FamiliesList: React.FC<{}> = () => {
  const [selectedPlaceStore, setPlaceStore] = React.useState<string>();
  // Redux state
  const list = useSelector<AppState, Family[]>(({ familiesReducer }) => familiesReducer.list as Family[]);
  const loading = useSelector<AppState, boolean>(({ familiesReducer }) => familiesReducer.loading);
  const placeStore = useSelector<AppState, PlaceStore[]>(
    ({ placeStoreReducer }) => placeStoreReducer.list as PlaceStore[]
  );

  const dataSource = React.useMemo(
    () =>
      list
        ?.map((family) => ({
          ...family,
          responsibleDependent: family.dependents?.find((dependent) => dependent?.isResponsible === true)
        }))
        .sort((a, b) => a.responsibleName?.localeCompare(b.responsibleName || '') || 0),
    [list]
  );

  // Redux actions
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(requestGetPlaceStore());
  }, [dispatch]);

  React.useEffect(() => {
    if (placeStore.length > 0) dispatch(requestGetPlaceFamilies(placeStore[0].id as number));
  }, [dispatch, placeStore]);

  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Famílias`}</Typography.Title>}
        extra={
          <>
            <Select
              style={{ width: 200 }}
              defaultValue={placeStore[0].id?.toString()}
              value={selectedPlaceStore}
              onSelect={(value) => {
                setPlaceStore(value);
                dispatch(requestGetPlaceFamilies(Number(value)));
              }}
            >
              {placeStore.map((placeStore) => (
                <Select.Option key={placeStore.id} value={Number(placeStore.id).toString()}>
                  {placeStore.title}
                </Select.Option>
              ))}
            </Select>
            <Link style={{ marginLeft: 15 }} to={`/familias/criar`}>
              <Button type="primary">Criar</Button>
            </Link>
          </>
        }
      >
        <Table loading={loading} dataSource={dataSource} rowKey="id">
          <Table.Column
            title="Nome do Responsável"
            width="30%"
            render={(family: Family & { responsibleDependent?: Dependent }) =>
              family.responsibleDependent?.name || family.responsibleDependent
            }
          />
          <Table.Column title="Código" dataIndex="code" width="20%" />
          <Table.Column title="Grupo familiar" dataIndex="groupName" width="20%" />
          <Table.Column
            title="Número de Dependentes"
            render={(family: Family) => family.dependents?.length || 0}
            width="20%"
          />
          <Table.Column
            width="10%"
            render={(item: User) => {
              return (
                <ActionWrapper>
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
