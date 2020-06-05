import React from 'react';
import { Modal, Button, Card, Table, Typography, Checkbox } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/rootReducer';
import { Product } from '../../interfaces/product';
import { requestGetProduct, requestDeleteProduct } from '../../redux/product/actions';
import { PageContainer, ActionWrapper } from './styles';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

/**
 * List component
 * @param props component props
 */
export const ProductList: React.FC<{}> = () => {
  // Redux state
  const loading = useSelector<AppState, boolean>((state) => state.productReducer.loading);
  const list = useSelector<AppState, Product[]>((state) => state.productReducer.list as Product[]);
  // Redux actions
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(requestGetProduct());
  }, [dispatch]);

  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Produtos`}</Typography.Title>}
        extra={
          <Link to={`/produtos/criar`}>
            <Button type="primary">Criar</Button>
          </Link>
        }
      >
        <Table rowKey="id" dataSource={list}>
          <Table.Column title="Nome" dataIndex="name" />
          <Table.Column
            title="Valido"
            dataIndex="isValid"
            render={(item: boolean) => {
              return <Checkbox checked={item || false} />;
            }}
          />
          <Table.Column
            render={(item: Product) => {
              return (
                <ActionWrapper>
                  <Link to={`/produtos/${item.id}/editar`}>
                    <Button>Editar</Button>
                  </Link>
                  <Button
                    danger
                    disabled={loading}
                    onClick={() =>
                      Modal.confirm({
                        title: 'Você realmente quer deletar esse registro?',
                        icon: <ExclamationCircleOutlined />,
                        okText: 'Sim',
                        okType: 'danger',
                        cancelText: 'Não',
                        onOk: () => {
                          dispatch(requestDeleteProduct(item.id as number));
                        }
                      })
                    }
                  >
                    Remover
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
