import { Button, Card, Table, Typography } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Benefit } from '../../interfaces/benefit';
import { requestDeleteBenefit, requestGetBenefit } from '../../redux/benefit/actions';
import { AppState } from '../../redux/rootReducer';
import { ActionWrapper, PageContainer } from './styles';
import { familyGroupList } from '../../utils/constraints';

/**
 * List component
 * @param props component props
 */
export const BenefitList: React.FC<{}> = (props) => {
  // Redux state
  const list = useSelector<AppState, Benefit[]>((state) => state.benefitReducer.list as Benefit[]);
  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(requestGetBenefit());
  }, [dispatch]);
  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Benefícios`}</Typography.Title>}
        extra={
          <Link to={`/beneficios/criar`}>
            <Button type="primary">Criar</Button>
          </Link>
        }
      >
        <Table dataSource={list}>
          <Table.Column title="Nome" dataIndex="title" />
          <Table.Column
            title="Grupo"
            dataIndex="groupName"
            render={(data: Benefit['groupName']) => familyGroupList[data]?.title || data}
          />
          <Table.Column title="Mês" dataIndex="month" />
          <Table.Column title="Ano" dataIndex="year" />
          <Table.Column title="Valor" dataIndex="value" render={(data: Benefit['value']) => `R$ ${data}`} />
          <Table.Column
            title="Criado"
            dataIndex="createdAt"
            render={(data: Benefit['createdAt']) => moment(data as Date).fromNow()}
          />
          <Table.Column
            render={(item: Benefit) => {
              return (
                <ActionWrapper>
                  <Link to={`/beneficios/${item.id}/editar`}>
                    <Button>Editar</Button>
                  </Link>
                  {/* TODO: Add alert on delete */}
                  <Button danger onClick={() => dispatch(requestDeleteBenefit(item.id as number))}>
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
