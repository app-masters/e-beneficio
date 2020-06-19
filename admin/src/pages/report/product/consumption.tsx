import React from 'react';
import { PageContainer, PrintableBodyWrapper, ColCheckStyle, RangePickerStyle } from '../styles';
import { Table, Form, Typography, Card, Button, Row, Col, DatePicker, Input, Checkbox } from 'antd';
import { formHelper, formValidation } from '../../../utils/constraints';
import { useFormik } from 'formik';
import yup from '../../../utils/yup';
import locale from 'antd/es/date-picker/locale/pt_BR';
import { formatCPF } from '../../../utils/string';
import { Flex } from '../../../components/flex';
import { useDispatch, useSelector } from 'react-redux';
import { requestGetConsumptionFamily } from '../../../redux/report/actions';
import { AppState } from '../../../redux/rootReducer';
import { ReportConsumptionFamily } from '../../../interfaces/report';
import moment from 'moment';
import { Dependent } from '../../../interfaces/dependent';
import { useHistory } from 'react-router-dom';

const schema = yup.object().shape({
  rangeFamily: yup.string().label('Data familia').required().nullable(),
  rangeConsumption: yup.string().label('Range consumo').nullable(),
  memberCpf: yup.string().label('Cpf do membro')
});

/**
 * ConsumptionFamilyList page
 */
export const ConsumptionFamilyList: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const report = useSelector<AppState, ReportConsumptionFamily[]>(
    ({ reportReducer }) => reportReducer.consumptionFamily as ReportConsumptionFamily[]
  );
  const loading = useSelector<AppState, boolean>(({ reportReducer }) => reportReducer.consumptionFamilyLoading);

  const initialValues = React.useMemo(() => {
    const localFilter = localStorage.getItem('e-beneficio-report-consumption-filter');
    if (localFilter) {
      const filter = JSON.parse(localFilter);

      if (Array.isArray(filter.rangeFamily))
        filter.rangeFamily = [moment(filter.rangeFamily[0] || undefined), moment(filter.rangeFamily[1] || undefined)];

      if (Array.isArray(filter.rangeConsumption))
        filter.rangeConsumption = [
          moment(filter.rangeConsumption[0] || undefined),
          moment(filter.rangeConsumption[1] || undefined)
        ];

      return filter;
    } else return null;
  }, []);

  const { values, getFieldMeta, submitForm, setFieldValue, getFieldProps } = useFormik({
    initialValues: initialValues || {
      rangeFamily: undefined,
      rangeConsumption: undefined,
      memberCpf: '',
      onlyWithoutConsumption: false
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      localStorage.setItem('e-beneficio-report-consumption-filter', JSON.stringify(values));
      dispatch(
        requestGetConsumptionFamily(
          values.rangeFamily,
          values.rangeConsumption,
          values.memberCpf,
          values.onlyWithoutConsumption
        )
      );
    }
  });

  const rangeFamilyMeta = getFieldMeta('rangeFamily');
  const rangeConsumptionMeta = getFieldMeta('rangeConsumption');
  const memberCpfMeta = getFieldMeta('memberCpf');

  const onlyWithoutConsumptionMeta = getFieldMeta('onlyWithoutConsumption');
  const onlyWithoutConsumptionField = getFieldProps('onlyWithoutConsumption');

  return (
    <PageContainer>
      <PrintableBodyWrapper>
        <Card
          title={<Typography.Title>{`Relatório - Consumo por Família`}</Typography.Title>}
          extra={
            <Button className="no-print" onClick={() => window.print()}>
              Imprimir
            </Button>
          }
        >
          <Form layout="vertical">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item
                  label="Data de registro família"
                  validateStatus={formValidation(rangeFamilyMeta)}
                  help={formHelper(rangeFamilyMeta)}
                >
                  <DatePicker.RangePicker
                    style={RangePickerStyle}
                    locale={locale}
                    defaultValue={values.rangeFamily}
                    format={'DD/MM/YYYY'}
                    onCalendarChange={(value) => {
                      setFieldValue('rangeFamily', value);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
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
              <Col span={8}>
                <Form.Item
                  label="Cpf do membro"
                  validateStatus={formValidation(memberCpfMeta)}
                  help={formHelper(memberCpfMeta)}
                >
                  <Input
                    id="memberCpf"
                    name="memberCpf"
                    onChange={(event) => setFieldValue('memberCpf', formatCPF(event.target.value))}
                    value={values.memberCpf}
                    onPressEnter={submitForm}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={12} style={ColCheckStyle}>
                <Form.Item
                  validateStatus={formValidation(onlyWithoutConsumptionMeta)}
                  help={formHelper(onlyWithoutConsumptionMeta)}
                >
                  <Checkbox checked={values.onlyWithoutConsumption} {...onlyWithoutConsumptionField}>
                    Apénas sem consumo
                  </Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Flex justifyContent={'flex-end'}>
                  <Button type="primary" onClick={submitForm}>
                    Filtrar
                  </Button>
                </Flex>
              </Col>
            </Row>
          </Form>
          <Table
            dataSource={report || []}
            onRow={(record) => {
              return {
                onClick: () => {
                  history.push(`/familias/${record.familyId}/info`);
                }
              };
            }}
            loading={loading}
            locale={{ emptyText: 'Nenhum dado disponível' }}
          >
            <Table.Column
              title={'Nome do Responsável'}
              key={'responsibleName'}
              dataIndex={'responsible'}
              render={(responsible: Dependent) => responsible.name}
            />
            <Table.Column
              title={'CPF do Responsável'}
              key={'responsibleCpf'}
              dataIndex={'responsible'}
              render={(responsible: Dependent) => responsible.cpf}
            />
            <Table.Column
              title={'Data de criação'}
              key={'createdAt'}
              dataIndex={'createdAt'}
              render={(created) => moment(created).format('DD/MM/YYYY')}
            />
            <Table.Column title={'Entidade'} key={'placeStoreId'} dataIndex={'placeStore'} />
            <Table.Column
              title={'Situação'}
              key={'status'}
              render={(item: ReportConsumptionFamily) => {
                if (item.neverConsumed) return 'Nunca consumiu';
                else if (item.consumedAll) return 'Consumiu todo saldo';
                else return 'Consumiu parte do saldo';
              }}
            />
            {/* <Table.Column
              title={'Nunca consumiu'}
              key={'neverConsumed'}
              align={'center'}
              dataIndex={'neverConsumed'}
              render={(neverCosumed) => <Checkbox checked={neverCosumed} />}
            />
            <Table.Column
              title={'Consumiu todo beneficio'}
              key={'consumedAll'}
              align={'center'}
              dataIndex={'consumedAll'}
              render={(consumedAll) => <Checkbox checked={consumedAll} />}
            /> */}
          </Table>
        </Card>
      </PrintableBodyWrapper>
    </PageContainer>
  );
};
