import { Button, Card, Table, Typography } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/rootReducer';
import { Product } from '../../interfaces/product';
import { requestGetProduct, requestSaveProduct } from '../../redux/product/actions';
import { ActionWrapper, PageContainer } from './styles';

/**
 * List component
 * @param props component props
 */
export const ProductList: React.FC<{}> = () => {
  const [data, setData] = React.useState<Product[]>();
  // Redux state
  const list = useSelector<AppState, Product[]>((state) => state.productReducer.list as Product[]);
  // Redux actions
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(requestGetProduct());
  }, [dispatch]);

  React.useEffect(() => {
    //When the request is too fast, the memory persist the buttons loading
    //Use this to prevent bug
    setData([]);
    setTimeout(() => {
      setData(list);
    }, 1);
  }, [list])

  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Produtos`}</Typography.Title>}
      >
        <Table rowKey="id" dataSource={data}>
          <Table.Column title="Nome" dataIndex="name" />
          <Table.Column
            render={(item: Product) => {
              return (
                <ProductAction key={item.id} item={item}/>
              );
            }}
          />
        </Table>
      </Card>
    </PageContainer>
  );
};



/**
 * ProductAction component
 * @param props component props
 */
export const ProductAction: React.FC<{item: Product}> = ({item}) => {
  const [isLoading, setLoading] = React.useState<string>('');
  // Redux actions
  const dispatch = useDispatch();

  const onValidateProduct = (item: Product, isValid: boolean) => () => {
    setLoading(isValid ? 'valid' : 'invalid');
    dispatch(requestSaveProduct(item, isValid));
  }

  return (
    <ActionWrapper>
      <Button 
        type="primary"
        disabled={isLoading === 'invalid'}
        onClick={onValidateProduct(item, true)}
        loading={isLoading === 'valid'}>Válido</Button>
      <Button 
        danger 
        disabled={isLoading === 'valid'}
        onClick={onValidateProduct(item, false)}
        loading={isLoading === 'invalid'}>Inválido</Button>
    </ActionWrapper>
  )
}