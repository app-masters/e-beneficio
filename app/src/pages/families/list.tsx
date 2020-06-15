import React, { useEffect, useMemo } from 'react';
import { Button, Card, Table, Typography, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { familyGroupList } from '../../utils/constraints';
import { Family } from '../../interfaces/family';
import { AppState } from '../../redux/rootReducer';
import { requestGetPlaceFamilies, requestDeactivateFamily } from '../../redux/family/actions';

import { ActionWrapper, PageContainer } from './styles';
import { Dependent } from '../../interfaces/dependent';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Group } from '../../interfaces/group';

/**
 * FamiliesList page component
 * @param props component props
 */
export const FamiliesList: React.FC<{}> = () => {
  // Redux state
  const list = useSelector<AppState, Family[]>((state) => state.familyReducer.list as Family[]);
  const familiesLoading = useSelector<AppState, boolean>((state) => state.familyReducer.loading);
  // const familiesError = useSelector<AppState, Error | undefined>((state) => state.familyReducer.error);

  const dataSource = useMemo(
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

  useEffect(() => {
    dispatch(requestGetPlaceFamilies());
  }, [dispatch]);

  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Famílias`}</Typography.Title>}
        extra={
          <Link to={`/familias/criar`}>
            <Button type="primary">Criar</Button>
          </Link>
        }
      >
        <Table loading={loading} dataSource={dataSource} rowKey="id">
          <Table.Column
            title="Nome do Responsável"
            width="18%"
            render={(family: Family & { responsibleDependent?: Dependent }) =>
              family.responsibleDependent?.name || family.responsibleDependent
            }
          />
          <Table.Column title="Código" dataIndex="code" width="18%" />
          <Table.Column
            title="Grupo familiar"
            dataIndex="groupName"
            render={(groupName: Family['groupName']) => familyGroupList && familyGroupList[groupName]?.title}
            width="18%"
          />
          <Table.Column
            title="Número de Dependentes"
            render={(family: Family) => family.dependents?.length || 0}
            width="18%"
          />
          <Table.Column
            title="Desativado"
            dataIndex="deactivatedAt"
            render={(deactivatedAt: Family['deactivatedAt']) =>
              deactivatedAt && moment(deactivatedAt as Date).fromNow()
            }
            width="18"
          />
          <Table.Column
            width="10%"
            render={(item: Family) => {
              return (
                <ActionWrapper>
                  <Link to={`/familias/${item.id}/editar`}>
                    <Button>Editar</Button>
                  </Link>
                  {!item.deactivatedAt && (
                    <Button
                      danger
                      disabled={familiesLoading}
                      onClick={() =>
                        Modal.confirm({
                          title: 'Você realmente quer desativar esse registro?',
                          icon: <ExclamationCircleOutlined />,
                          okText: 'Sim',
                          okType: 'danger',
                          cancelText: 'Não',
                          onOk: () => {
                            dispatch(requestDeactivateFamily(item.id as number));
                          }
                        })
                      }
                    >
                      Desativar
                    </Button>
                  )}
                </ActionWrapper>
              );
            }}
          />
        </Table>
      </Card>
    </PageContainer>
  );
};
