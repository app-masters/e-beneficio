import React from 'react';
import { PageContainer, PrintableBodyWrapper, RangePickerStyle } from '../styles';
import { Table, Form, Typography, Card, Button, Row, Col, DatePicker } from 'antd';
import { formHelper, formValidation } from '../../../utils/constraints';
import { useFormik } from 'formik';
import yup from '../../../utils/yup';
import locale from 'antd/es/date-picker/locale/pt_BR';
import { Flex } from '../../../components/flex';
import { useDispatch, useSelector } from 'react-redux';
import { requestGetConsumptionPlaceStore } from '../../../redux/report/actions';
import { AppState } from '../../../redux/rootReducer';
import { ReportConsumptionPlaceStore } from '../../../interfaces/report';
import moment from 'moment';

const schema = yup.object().shape({
  rangeConsumption: yup.string().label('Range consumo').nullable()
});

/**
 * ConsumptionPlaceStoreList page
 */
export const ConsumptionPlaceStoreList: React.FC<{}> = () => {
  const dispatch = useDispatch();

  const report = useSelector<AppState, ReportConsumptionPlaceStore[]>(
    ({ reportReducer }) => reportReducer.consumptionPlaceStore as ReportConsumptionPlaceStore[]
  );
  const loading = useSelector<AppState, boolean>(({ reportReducer }) => reportReducer.consumptionPlaceStoreLoading);

  const initialValues = React.useMemo(() => {
    const localFilter = localStorage.getItem('e-beneficio-report-consumption-placeStore-filter');
    if (localFilter) {
      const filter = JSON.parse(localFilter);

      if (Array.isArray(filter.rangeConsumption))
        filter.rangeConsumption = [
          moment(filter.rangeConsumption[0] || undefined),
          moment(filter.rangeConsumption[1] || undefined)
        ];

      return filter;
    } else return null;
  }, []);

  const { values, getFieldMeta, submitForm, setFieldValue } = useFormik({
    initialValues: initialValues || {
      rangeConsumption: undefined
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      localStorage.setItem('e-beneficio-report-consumption-placeStore-filter', JSON.stringify(values));
      dispatch(requestGetConsumptionPlaceStore(values.rangeConsumption));
    }
  });

  const rangeConsumptionMeta = getFieldMeta('rangeConsumption');

  return (
    <PageContainer>
      <PrintableBodyWrapper>
        <Card
          title={<Typography.Title>{`Relatório - Consumo por Estabelecimento`}</Typography.Title>}
          extra={
            <Button className="no-print" onClick={() => window.print()}>
              Imprimir
            </Button>
          }
        >
          <Form layout="vertical">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Row gutter={[16, 0]}>
                  <Col span={20}>
                    <Form.Item
                      label="Data de registro consumo"
                      validateStatus={formValidation(rangeConsumptionMeta)}
                      help={formHelper(rangeConsumptionMeta)}
                    >
                      <DatePicker.RangePicker
                        style={RangePickerStyle}
                        locale={locale}
                        defaultValue={values.rangeConsumption}
                        format={'DD/MM/YYYY'}
                        onCalendarChange={(value) => {
                          setFieldValue('rangeConsumption', value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Flex alignItems={'center'}>
                    <Col span={4} style={{ paddingTop: 15 }}>
                      <Button type="primary" onClick={submitForm}>
                        Filtrar
                      </Button>
                    </Col>
                  </Flex>
                </Row>
              </Col>
            </Row>
          </Form>
          <Table dataSource={report || []} loading={loading} locale={{ emptyText: 'Nenhum dado disponível' }}>
            <Table.Column title={'Estabelecimento'} key={'placeStore'} dataIndex={'placeStore'} />
            <Table.Column title={'Famílias registradas'} key={'familiesAmount'} dataIndex={'familiesAmount'} />
            <Table.Column title={'Total consumido'} key={'consumedAmount'} dataIndex={'consumedAmount'} />
            <Table.Column title={'Não consumido'} key={'consumedAvailable'} dataIndex={'consumedAvailable'} />
          </Table>
        </Card>
      </PrintableBodyWrapper>
    </PageContainer>
  );
};
