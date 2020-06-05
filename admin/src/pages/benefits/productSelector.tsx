import { Col, Form } from 'antd';
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestGetProduct } from '../../redux/product/actions';
import { AppState } from '../../redux/rootReducer';
import { Divider, DividerColumn } from './styles';
import { Product } from '../../interfaces/product';
import { ResourceSelector, ResourceSelectorValueItem } from '../../components/resourceSelector';
import { FormItemProps } from 'antd/lib/form';

export interface ProductSelectorProps {
  onChange?: (value: ResourceSelectorValueItem<'productsId'>[]) => void;
  value?: ResourceSelectorValueItem<'productsId'>[];
  validateStatus?: FormItemProps['validateStatus'];
  help?: FormItemProps['help'];
}

/**
 * List component
 * @param props component props
 */
export const ProductSelector: React.FC<ProductSelectorProps> = (props) => {
  // Redux state
  const list = useSelector<AppState, Product[]>((state) => state.productReducer.list as Product[]);
  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(requestGetProduct());
  }, [dispatch]);

  // For each item in the list,
  const datasource = useMemo(
    () =>
      list.map((product) => ({
        productsId: product.id || 0,
        name: product.name,
        amount: 0
      })),
    [list]
  );

  return (
    <>
      <DividerColumn>
        <Divider />
      </DividerColumn>
      <Col span={11}>
        <Form.Item label={'Produtos'} validateStatus={props.validateStatus} help={props.help}>
          <ResourceSelector
            idName="productsId"
            datasource={datasource}
            value={props.value || []}
            onChange={props.onChange}
          />
        </Form.Item>
      </Col>
    </>
  );
};
