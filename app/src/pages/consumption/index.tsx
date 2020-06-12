import React from 'react';
import { Button, Card, Typography, Table, Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { FamilySearch } from '../../components/familySearch';
import { Flex } from '../../components/flex';
import { Family, FamilyProductConsumption } from '../../interfaces/family';
import { requestSaveConsumptionProduct, requestClearConsumptionProduct } from '../../redux/consumption/actions';
import { AppState } from '../../redux/rootReducer';
import { PageContainer } from './styles';
import { NumberPicker } from '../../components/numberPicker';
import { Consumption } from '../../interfaces/consumption';
import { requestClearFamily } from '../../redux/family/actions';

/**
 * Dashboard page component
 * @param props component props
 */
export const ConsumptionForm: React.FC<RouteComponentProps<{ id: string }>> = () => {
  const [currentFamily, setFamily] = React.useState<number | string>();
  const history = useHistory();
  const dispatch = useDispatch();
  const family = useSelector<AppState, Family | null | undefined>(({ familyReducer }) => familyReducer.item);
  const consumption = useSelector<AppState, Consumption | undefined>(
    ({ consumptionReducer }) => consumptionReducer.item
  );

  const loading = useSelector<AppState, boolean>((state) => state.consumptionReducer.loading);

  React.useEffect(() => {
    if (consumption) {
      Modal.success({
        title: 'Consumo salvo com sucesso',
        maskClosable: false,
        onOk: () => {
          dispatch(requestClearConsumptionProduct());
          dispatch(requestClearFamily());
          history.push('/');
        }
      });
    }
  }, [dispatch, consumption, history]);

  return (
    <PageContainer>
      <Card title={<Typography.Title>{'Informar consumo'}</Typography.Title>}>
        <FamilySearch onFamilySelect={(id) => setFamily(id)} />
        {currentFamily && <ProductConsumption family={family} loading={loading} />}
      </Card>
    </PageContainer>
  );
};

/**
 * Product Consumption form
 * @param props component props
 */
const ProductConsumption: React.FC<{ family?: Family | null; loading?: boolean }> = ({ family, loading }) => {
  const [dataSource, setDataSource] = React.useState<FamilyProductConsumption[]>(
    family?.balance as FamilyProductConsumption[]
  );

  const dispatch = useDispatch();

  /**
   * Function to change the consumed value
   */
  const onSubmitConsumption = () => {
    const consumption = {
      familyId: family?.id as number,
      products: dataSource
        .map((item) => {
          return { id: item.product.id as number, amount: item.consume as number };
        })
        .filter((f) => f.amount)
    };
    dispatch(requestSaveConsumptionProduct(consumption));
  };

  /**
   * Function to change the consumed value
   */
  const onChangeItemValue = (value: number, productId: number) => {
    const list = JSON.parse(JSON.stringify(dataSource));
    const indexItem = dataSource.findIndex((f) => f.product.id === productId);
    list[indexItem].consume = value;
    setDataSource(list);
  };

  const columns = [
    {
      title: 'Produto',
      dataIndex: 'product',
      key: 'product',
      render: (text: FamilyProductConsumption['product']) => text.name
    },
    {
      title: 'Disponível',
      dataIndex: 'amountAvailable',
      key: 'amountAvailable'
    },
    {
      title: 'Consumir',
      key: 'action',
      render: (text: FamilyProductConsumption) => {
        return <NumberPickComponent defaultItem={text} onChange={onChangeItemValue} />;
      }
    }
  ];

  return (
    <div>
      <h2>Produtos</h2>
      <Table pagination={false} columns={columns} dataSource={dataSource || []} />
      <Flex style={{ marginTop: 25 }} alignItems="center" justifyContent="flex-end">
        <Button loading={loading} onClick={onSubmitConsumption} htmlType="submit" type="primary">
          Confirmar consumo
        </Button>
      </Flex>
    </div>
  );
};

/**
 * Pick component
 * @param props component props
 */
const NumberPickComponent: React.FC<{
  defaultItem: FamilyProductConsumption;
  onChange: (value: number, productId: number) => void;
}> = ({ defaultItem, onChange }) => {
  const [value, setValue] = React.useState<number>(0);
  return (
    <NumberPicker
      value={value}
      maxValue={defaultItem.amountAvailable}
      onChange={(value) => {
        setValue(value);
        onChange(value, defaultItem.product.id as number);
      }}
    />
  );
};
