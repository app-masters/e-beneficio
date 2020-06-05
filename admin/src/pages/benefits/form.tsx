import { Alert, Col, DatePicker, Form, Input, Modal, Row, Select, Spin } from 'antd';
import locale from 'antd/es/date-picker/locale/pt_BR';
import { useFormik } from 'formik';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Benefit } from '../../interfaces/benefit';
import { Institution } from '../../interfaces/institution';
import { requestSaveBenefit } from '../../redux/benefit/actions';
import { requestGetInstitution } from '../../redux/institution/actions';
import { AppState } from '../../redux/rootReducer';
import { familyGroupList } from '../../utils/constraints';
import yup from '../../utils/yup';
import { ProductSelector } from './productSelector';
import { env } from '../../env';

const TYPE = env.REACT_APP_CONSUMPTION_TYPE as 'ticket' | 'product';
const showProductList = TYPE === 'product';

const { Option } = Select;

const schema = yup.object().shape({
  institutionId: yup.number().label('Instituição').required(),
  groupName: yup.string().label('Família').required(),
  title: yup.string().label('Nome').required(),
  month: yup.number().label('Mês').required(),
  year: yup.number().label('Ano').required(),
  value: !showProductList ? yup.string().label('Valor').required() : yup.string().label('Valor').nullable(),
  products: showProductList
    ? yup
        .array()
        .test(
          'atLeastOne',
          'Pelo menos um produto deve ser selecionado',
          (value?: { productId: number | string; amount: number }[]) =>
            !!value && value.length > 0 && value.reduce((total, item) => total + (item ? item.amount : 0), 0) > 0
        )
    : yup.array().nullable()
});

/**
 * Dashboard page component
 * @param props component props
 */
export const BenefitForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const history = useHistory();
  const isCreating = props.match.params.id === 'criar';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(requestGetInstitution());
  }, [dispatch]);

  // Redux state
  const benefit = useSelector<AppState, Benefit | undefined>(({ benefitReducer }) =>
    benefitReducer.list.find((item: Benefit) => item.id === Number(props.match.params.id))
  );

  const loading = useSelector<AppState, boolean>(({ benefitReducer }) => benefitReducer.loading);
  const institutionLoading = useSelector<AppState, boolean>(({ institutionReducer }) => institutionReducer.loading);
  const institutionList = useSelector<AppState, Institution[]>(({ institutionReducer }) => institutionReducer.list);

  const {
    handleSubmit,
    handleChange,
    values,
    getFieldMeta,
    submitForm,
    status,
    errors,
    touched,
    setFieldValue,
    setFieldTouched
  } = useFormik({
    initialValues: benefit || {
      institutionId: !institutionLoading && institutionList && institutionList.length > 0 ? institutionList[0].id : 1,
      groupName: 'children',
      title: '',
      month: undefined,
      year: undefined,
      value: undefined,
      products: undefined
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      dispatch(
        requestSaveBenefit(
          values,
          () => history.push('/beneficios'),
          () => setStatus('Ocorreu um erro ao realizar a requisição.')
        )
      );
    }
  });

  const titleMeta = getFieldMeta('title');
  const groupMeta = getFieldMeta('groupName');
  const monthMeta = getFieldMeta('month');
  const yearMeta = getFieldMeta('year');
  const valueMeta = getFieldMeta('value');
  const institutionIdMeta = getFieldMeta('institutionId');
  const productsMeta = getFieldMeta('products');

  return (
    <Modal
      title={isCreating ? 'Criar' : 'Editar'}
      visible={true}
      onCancel={() => history.push('/beneficios')}
      onOk={submitForm}
      confirmLoading={loading}
      width={showProductList ? 840 : undefined}
      okType={errors && Object.keys(errors).length > 0 && touched ? 'danger' : 'primary'}
    >
      {status && <Alert message="Erro no formulário" description={status} type="error" />}
      <form onSubmit={handleSubmit}>
        <Form layout="vertical">
          <Row justify="space-between">
            <Col span={showProductList ? 11 : 24}>
              <Form.Item
                label={'Nome'}
                validateStatus={!!titleMeta.error && !!titleMeta.touched ? 'error' : ''}
                help={!!titleMeta.error && !!titleMeta.touched ? titleMeta.error : undefined}
              >
                <Input id="title" name="title" onChange={handleChange} value={values.title} onPressEnter={submitForm} />
              </Form.Item>

              <Form.Item
                label={'Instituição'}
                validateStatus={!!institutionIdMeta.error && !!institutionIdMeta.touched ? 'error' : ''}
                help={!!institutionIdMeta.error && !!institutionIdMeta.touched ? institutionIdMeta.error : undefined}
              >
                <Select
                  disabled={institutionLoading}
                  defaultValue={values.institutionId?.toString()}
                  onSelect={(value) => setFieldValue('institutionId', Number(value))}
                  value={values.institutionId?.toString() || undefined}
                  notFoundContent={institutionLoading ? <Spin size="small" /> : null}
                  onChange={(value: string) => {
                    setFieldValue('institutionId', Number(value));
                  }}
                  onBlur={() => {
                    setFieldTouched('institutionId', true);
                  }}
                >
                  {!institutionLoading &&
                    institutionList &&
                    institutionList.length > 0 &&
                    institutionList.map((institution) => (
                      <Option key={institution.id} value={institution.id?.toString() || '-1'}>
                        {institution.title}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={'Grupo'}
                validateStatus={!!groupMeta.error && !!groupMeta.touched ? 'error' : ''}
                help={!!groupMeta.error && !!groupMeta.touched ? groupMeta.error : undefined}
              >
                <Select
                  defaultValue={values.groupName}
                  onSelect={(value) => setFieldValue('groupName', value)}
                  value={values.groupName || undefined}
                  onChange={(value: string) => {
                    setFieldValue('groupName', value);
                  }}
                  onBlur={() => {
                    setFieldTouched('groupName', true);
                  }}
                >
                  {Object.keys(familyGroupList).map((key) => (
                    <Option key={key} value={key}>
                      {familyGroupList[key].title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label={'Mês'}
                    validateStatus={!!monthMeta.error && !!monthMeta.touched ? 'error' : ''}
                    help={!!monthMeta.error && !!monthMeta.touched ? monthMeta.error : undefined}
                  >
                    <DatePicker.MonthPicker
                      format={'MMMM'}
                      locale={locale}
                      style={{ width: '100%' }}
                      defaultValue={values.month ? moment(values.month, 'MM') : undefined}
                      onChange={(date) => setFieldValue('month', Number(date?.format('MM')))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={'Ano'}
                    validateStatus={!!yearMeta.error && !!yearMeta.touched ? 'error' : ''}
                    help={!!yearMeta.error && !!yearMeta.touched ? yearMeta.error : undefined}
                  >
                    <DatePicker.YearPicker
                      format={'YYYY'}
                      locale={locale}
                      style={{ width: '100%' }}
                      defaultValue={values.year ? moment(values.year, 'YYYY') : undefined}
                      onChange={(date) => setFieldValue('year', Number(date?.format('YYYY')))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Value per dependent should only be shown when the TYPE is `ticket` */}
              {!showProductList && (
                <Form.Item
                  label="Valor por dependente"
                  validateStatus={!!valueMeta.error && !!valueMeta.touched ? 'error' : ''}
                  help={!!valueMeta.error && !!valueMeta.touched ? valueMeta.error : undefined}
                >
                  <Input id="value" name="value" prefix="R$" onChange={handleChange} value={values.value} />
                </Form.Item>
              )}
            </Col>
            {showProductList && (
              <ProductSelector
                validateStatus={!!productsMeta.error && !!productsMeta.touched ? 'error' : ''}
                help={!!productsMeta.error && !!productsMeta.touched ? productsMeta.error : undefined}
                value={values.products}
                onChange={(value) => {
                  setFieldValue('products', value);
                }}
              />
            )}
          </Row>
        </Form>
      </form>
    </Modal>
  );
};
