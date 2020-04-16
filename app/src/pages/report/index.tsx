import React from 'react';
import { PageContainer, PrintableBodyWrapper } from './styles';
import { Card, Typography, Form, Button, DatePicker, Row, Col, Table } from 'antd';
import { useFormik } from 'formik';
import yup from '../../utils/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/rootReducer';
import { requestGetConsumption } from '../../redux/report/actions';
import { Report, ConsumptionPlace } from '../../interfaces/report';
import moment from 'moment';
import Text from 'antd/lib/typography/Text';
import locale from 'antd/es/date-picker/locale/pt_BR';

const schema = yup.object().shape({
  rangeDate: yup.string().label('Data').required()
});

const { RangePicker } = DatePicker;

/**
 * List component
 * @param props component props
 */
export const ReportList: React.FC<{}> = () => {
  // Redux state
  const reportLoading = useSelector<AppState, boolean>(({ reportReducer }) => reportReducer.loading);
  const reportData = useSelector<AppState, Report | undefined>(({ reportReducer }) => reportReducer.item);

  const dispatch = useDispatch();

  const { handleSubmit, getFieldMeta, submitForm, setFieldValue } = useFormik({
    initialValues: {
      rangeDate: ''
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      const minDate = moment(values.rangeDate[0]).format('MM-DD-YYYY');
      const maxDate = moment(values.rangeDate[1]).format('MM-DD-YYYY');
      dispatch(requestGetConsumption(minDate, maxDate));
    }
  });

  const rangeDateMeta = getFieldMeta('rangeDate');

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
                <Col span={24}>
                  <Form.Item
                    label="Data"
                    validateStatus={!!rangeDateMeta.error && !!rangeDateMeta.touched ? 'error' : ''}
                    help={!!rangeDateMeta.error && !!rangeDateMeta.touched ? rangeDateMeta.error : undefined}
                  >
                    <Row gutter={[8, 8]}>
                      <Col>
                        <RangePicker
                          locale={locale}
                          format={'DD/MM/YYYY'}
                          onCalendarChange={(value) => {
                            setFieldValue('rangeDate', value);
                          }}
                        />
                      </Col>
                      <Col>
                        <Button className="no-print" type="primary" onClick={submitForm}>
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
                    <th>
                      <Text>{`Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}`}</Text>
                    </th>
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
              render={(data: ConsumptionPlace['total']) => `R$ ${data.toFixed(2).replace('.', ',')}`}
            />
          </Table>
        </Card>
      </PrintableBodyWrapper>
    </PageContainer>
  );
};
