import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Table, Typography } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Benefit } from '../../interfaces/benefit';
import { requestDeleteBenefit, requestGetBenefit } from '../../redux/benefit/actions';
import { AppState } from '../../redux/rootReducer';
import { familyGroupList } from '../../utils/constraints';
import { ActionWrapper, PageContainer } from './styles';
import { formatMoney } from '../../utils/string';

/**
 * List component
 * @param props component props
 */
export const BenefitList: React.FC<{}> = () => {
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
          <Table.Column
            title="Valor por dependente"
            dataIndex="value"
            render={(data: Benefit['value']) => `R$ ${formatMoney(data)}`}
          />
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
                          dispatch(requestDeleteBenefit(item.id as number));
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
