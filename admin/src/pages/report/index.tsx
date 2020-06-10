import React, { useEffect } from 'react';
import { PageContainer, PrintableBodyWrapper, Th, RangePickerStyle } from './styles';
import { Card, Spin, Typography, Form, Button, DatePicker, Select, Row, Col, Table } from 'antd';
import { useFormik } from 'formik';
import yup from '../../utils/yup';
import { useDispatch, useSelector } from 'react-redux';
import { requestGetEntity } from '../../redux/entity/actions';
import { AppState } from '../../redux/rootReducer';
import { Entity } from '../../interfaces/entity';
import { requestGetLocality } from '../../redux/locality/actions';
import { Locality } from '../../interfaces/locality';
import { requestGetConsumption } from '../../redux/report/actions';
import { Report, ConsumptionPlace } from '../../interfaces/report';
import moment from 'moment';
import Text from 'antd/lib/typography/Text';
import locale from 'antd/es/date-picker/locale/pt_BR';

const schema = yup.object().shape({
  rangeDate: yup.string().label('Data').required(),
  placeId: yup.string().label('Estabelecimento').required(),
  placeStoreId: yup.string().label('Loja').notRequired()
});

const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * List component
 * @param props component props
 */
export const ReportList: React.FC<{}> = () => {
  // Redux state
  const entityLoading = useSelector<AppState, boolean>(({ entityReducer }) => entityReducer.loading);
  const entityList = useSelector<AppState, Entity[]>(({ entityReducer }) => entityReducer.list);
  const localityLoading = useSelector<AppState, boolean>(({ localityReducer }) => localityReducer.loading);
  const localityList = useSelector<AppState, Locality[]>(({ localityReducer }) => localityReducer.list);
  const reportLoading = useSelector<AppState, boolean>(({ reportReducer }) => reportReducer.loading);
  const reportData = useSelector<AppState, Report | undefined>(({ reportReducer }) => reportReducer.item);

  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    if (!entityList || entityList.length <= 0) {
      dispatch(requestGetEntity());
    }
  }, [dispatch, entityList]);

  const { handleSubmit, values, getFieldMeta, submitForm, setFieldValue, setFieldTouched } = useFormik({
    initialValues: {
      rangeDate: '',
      placeId: '',
      placeStoreId: ''
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      const minDate = moment(values.rangeDate[0]).format('MM-DD-YYYY');
      const maxDate = moment(values.rangeDate[1]).format('MM-DD-YYYY');
      dispatch(requestGetConsumption(minDate, maxDate, Number(values.placeId), Number(values.placeStoreId)));
    }
  });

  const rangeDateMeta = getFieldMeta('rangeDate');
  const placeIdMeta = getFieldMeta('placeId');
  const placeStoreIdMeta = getFieldMeta('placeStoreId');

  return (
    <PageContainer>
      <PrintableBodyWrapper>
        <Card
          title={<Typography.Title>{`Relatório de consumo`}</Typography.Title>}
          extra={
            <Button className="no-print" onClick={() => window.print()}>
              Imprimir
            </Button>
          }
        >
          <form onSubmit={handleSubmit}>
            <Form layout="vertical">
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Form.Item
                    label="Estabelecimento"
                    validateStatus={!!placeIdMeta.error && !!placeIdMeta.touched ? 'error' : ''}
                    help={!!placeIdMeta.error && !!placeIdMeta.touched ? placeIdMeta.error : undefined}
                  >
                    <Select
                      defaultValue={values.placeId?.toString()}
                      onSelect={(value) => setFieldValue('placeId', Number(value))}
                      value={values.placeId?.toString() || undefined}
                      notFoundContent={true ? <Spin size="small" /> : null}
                      onChange={(value: string) => {
                        setFieldValue('placeId', Number(value));
                        setFieldValue('placeStoreId', '');
                        dispatch(requestGetLocality(Number(value)));
                      }}
                      onBlur={() => {
                        setFieldTouched('placeId', true);
                      }}
                    >
                      {!entityLoading &&
                        entityList &&
                        entityList.length > 0 &&
                        entityList.map((entity) => (
                          <Option key={entity.title} value={entity.id?.toString() || '-1'}>
                            {entity.title}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Loja"
                    validateStatus={!!placeStoreIdMeta.error && !!placeStoreIdMeta.touched ? 'error' : ''}
                    help={!!placeStoreIdMeta.error && !!placeStoreIdMeta.touched ? placeStoreIdMeta.error : undefined}
                  >
                    <Select
                      allowClear
                      disabled={values.placeId === ''}
                      defaultValue={values.placeStoreId?.toString()}
                      onSelect={(value) => setFieldValue('placeStoreId', Number(value))}
                      value={values.placeStoreId?.toString() || undefined}
                      notFoundContent={true ? <Spin size="small" /> : null}
                      onChange={(value: string) => {
                        setFieldValue('placeStoreId', value ? Number(value) : '');
                      }}
                      onBlur={() => {
                        setFieldTouched('placeStoreId', true);
                      }}
                    >
                      <Option value={'-1'}>{'  '}</Option>
                      {!localityLoading &&
                        localityList &&
                        localityList.length > 0 &&
                        localityList.map((locality) => (
                          <Option key={locality.title} value={locality.id?.toString() || '-1'}>
                            {locality.title}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[8, 8]}>
                <Col span={12} />
                <Col span={12}>
                  <Form.Item
                    label="Data"
                    validateStatus={!!rangeDateMeta.error && !!rangeDateMeta.touched ? 'error' : ''}
                    help={!!rangeDateMeta.error && !!rangeDateMeta.touched ? rangeDateMeta.error : undefined}
                  >
                    <Row gutter={[8, 8]}>
                      <Col flex={1}>
                        <RangePicker
                          locale={locale}
                          format={'DD/MM/YYYY'}
                          style={RangePickerStyle}
                          onCalendarChange={(value) => {
                            setFieldValue('rangeDate', value);
                          }}
                        />
                      </Col>
                      <Col className="no-print">
                        <Button type="primary" onClick={submitForm}>
                          Filtrar
                        </Button>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </form>
          <Table
            dataSource={reportData?.data}
            loading={reportLoading}
            pagination={false}
            summary={(pageData) => {
              let totalPrice = 0;
              pageData.forEach(({ total }) => {
                totalPrice += Number(total);
              });
              return (
                <>
                  <tr>
                    <td />
                    <td />
                    <td />
                    <Th>
                      <Text>{`Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}`}</Text>
                    </Th>
                  </tr>
                </>
              );
            }}
          >
            <Table.Column
              title="Loja"
              dataIndex="placeStore"
              render={(data: ConsumptionPlace['placeStore']) => `${data.title}`}
            />
            <Table.Column
              title="CNPJ"
              dataIndex="placeStore"
              render={(data: ConsumptionPlace['placeStore']) => `${data.cnpj || ''}`}
            />
            <Table.Column
              title="Endereço"
              dataIndex="placeStore"
              render={(data: ConsumptionPlace['placeStore']) => `${data.address || ''}`}
            />
            <Table.Column
              title="Total consumo"
              dataIndex="total"
              align="right"
              render={(data: ConsumptionPlace['total']) => `R$ ${data.toFixed(2).replace('.', ',')}`}
            />
          </Table>
        </Card>
      </PrintableBodyWrapper>
    </PageContainer>
  );
};
