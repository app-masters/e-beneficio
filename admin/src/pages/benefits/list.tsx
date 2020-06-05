import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Table, Typography } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Benefit } from '../../interfaces/benefit';
import { Product } from '../../interfaces/product';
import { requestDeleteBenefit, requestGetBenefit } from '../../redux/benefit/actions';
import { AppState } from '../../redux/rootReducer';
import { familyGroupList } from '../../utils/constraints';
import { ActionWrapper, PageContainer } from './styles';
import { env } from '../../env';
import { requestGetProduct } from '../../redux/product/actions';

const TYPE = env.REACT_APP_CONSUMPTION_TYPE as 'ticket' | 'product';
const showProductList = TYPE === 'product';

/**
 * List component
 * @param props component props
 */
export const BenefitList: React.FC<{}> = () => {
  // Redux state
  const list = useSelector<AppState, Benefit[]>((state) => state.benefitReducer.list as Benefit[]);
  const productList = useSelector<AppState, Product[]>((state) => state.productReducer.list as Product[]);

  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(requestGetBenefit());
    dispatch(requestGetProduct());
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
        <Table dataSource={list} rowKey="id">
          <Table.Column title="Nome" dataIndex="title" />
          <Table.Column
            title="Grupo"
            dataIndex="groupName"
            render={(data: Benefit['groupName']) => familyGroupList[data]?.title || data}
          />
          <Table.Column title="Mês" dataIndex="month" />
          <Table.Column title="Ano" dataIndex="year" />
          {/* Show the product list column depending on the type of benefit */}
          {showProductList ? (
            <Table.Column
              title="Produtos"
              dataIndex="benefitProduct"
              render={(data: Benefit['benefitProduct']) =>
                data?.map((product) => (
                  <div key={product.productsId}>{`${product.amount}x ${
                    productList.find((p) => p.id === product.productsId)?.name
                  }`}</div>
                ))
              }
            />
          ) : (
            <Table.Column
              title="Valor por dependente"
              dataIndex="value"
              render={(data: Benefit['value']) => `R$ ${data}`}
            />
          )}
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
