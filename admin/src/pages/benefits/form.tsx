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
import yup from '../../utils/yup';
import { ProductSelector } from './productSelector';
import { env } from '../../env';
import { Group } from '../../interfaces/group';
import { requestGetGroup } from '../../redux/group/actions';

const TYPE = env.REACT_APP_CONSUMPTION_TYPE as 'ticket' | 'product';
const isConsumptionProduct = TYPE === 'product';

const { Option } = Select;

const schema = yup.object().shape({
  institutionId: yup.number().label('Instituição').required(),
  groupId: yup.number().label('Grupo familiar').required(),
  title: yup.string().label('Nome').required(),
  date: yup.date().label('Data de início').required(),
  value: !isConsumptionProduct ? yup.string().label('Valor').required() : yup.string().label('Valor').nullable(),
  benefitProducts: isConsumptionProduct
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

  React.useEffect(() => {
    dispatch(requestGetGroup());
  }, [dispatch]);

  // Redux state
  const benefit = useSelector<AppState, Benefit | undefined>(({ benefitReducer }) =>
    benefitReducer.list.find((item: Benefit) => item.id === Number(props.match.params.id))
  );

  const loading = useSelector<AppState, boolean>(({ benefitReducer }) => benefitReducer.loading);
  const institutionLoading = useSelector<AppState, boolean>(({ institutionReducer }) => institutionReducer.loading);
  const institutionList = useSelector<AppState, Institution[]>(({ institutionReducer }) => institutionReducer.list);
  const groups = useSelector<AppState, Group[]>(({ groupReducer }) => groupReducer.list as Group[]);

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
      groupId: 1,
      title: '',
      date: undefined,
      year: undefined,
      value: undefined,
      benefitProducts: undefined
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
  const groupMeta = getFieldMeta('groupId');
  const dateMeta = getFieldMeta('year');
  const valueMeta = getFieldMeta('value');
  const institutionIdMeta = getFieldMeta('institutionId');
  const productsMeta = getFieldMeta('benefitProducts');

  const dateFormat = 'DD/MM/YYYY';

  return (
    <Modal
      title={isCreating ? 'Criar' : 'Editar'}
      visible={true}
      onCancel={() => history.push('/beneficios')}
      onOk={submitForm}
      confirmLoading={loading}
      width={isConsumptionProduct ? 840 : undefined}
      okType={errors && Object.keys(errors).length > 0 && touched ? 'danger' : 'primary'}
    >
      {status && <Alert message="Erro no formulário" description={status} type="error" />}
      <form onSubmit={handleSubmit}>
        <Form layout="vertical">
          <Row justify="space-between">
            <Col span={isConsumptionProduct ? 11 : 24}>
              <Form.Item
                label={'Nome'}
                validateStatus={!!titleMeta.error && !!titleMeta.touched ? 'error' : ''}
                help={!!titleMeta.error && !!titleMeta.touched ? titleMeta.error : undefined}
              >
                <Input id="title" name="title" onChange={handleChange} value={values.title} onPressEnter={submitForm} />
              </Form.Item>
              <Form.Item
                label={'Data de início'}
                validateStatus={!!dateMeta.error && !!dateMeta.touched ? 'error' : ''}
                help={!!dateMeta.error && !!dateMeta.touched ? dateMeta.error : undefined}
              >
                <DatePicker
                  locale={locale}
                  picker="month"
                  name="date"
                  style={{ width: '100%' }}
                  format={dateFormat}
                  defaultValue={values.date ? moment(values.date) : undefined}
                  onChange={(date) => {
                    setFieldValue('date', date);
                  }}
                />
              </Form.Item>

              <Form.Item
                label={isConsumptionProduct ? 'Origem do benefício' : 'Instituição'}
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
                label={'Grupo famíliar'}
                validateStatus={!!groupMeta.error && !!groupMeta.touched ? 'error' : ''}
                help={!!groupMeta.error && !!groupMeta.touched ? groupMeta.error : undefined}
              >
                <Select
                  defaultValue={values.groupId?.toString()}
                  onSelect={(value) => setFieldValue('groupId', value)}
                  value={values.groupId?.toString() || undefined}
                  onChange={(value: string) => {
                    setFieldValue('groupId', value);
                  }}
                  onBlur={() => {
                    setFieldTouched('groupId', true);
                  }}
                >
                  {groups.map((item: Group) => (
                    <Select.Option key={item.id} value={Number(item.id).toString()}>
                      {item.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Value per dependent should only be shown when the TYPE is `ticket` */}
              {!isConsumptionProduct && (
                <Form.Item
                  label="Valor por dependente"
                  validateStatus={!!valueMeta.error && !!valueMeta.touched ? 'error' : ''}
                  help={!!valueMeta.error && !!valueMeta.touched ? valueMeta.error : undefined}
                >
                  <Input id="value" name="value" prefix="R$" onChange={handleChange} value={values.value} />
                </Form.Item>
              )}
            </Col>
            {isConsumptionProduct && (
              <ProductSelector
                validateStatus={!!productsMeta.error && !!productsMeta.touched ? 'error' : ''}
                help={!!productsMeta.error && !!productsMeta.touched ? productsMeta.error : undefined}
                value={values.benefitProducts}
                onChange={(value) => {
                  setFieldValue('benefitProducts', value);
                }}
              />
            )}
          </Row>
        </Form>
      </form>
    </Modal>
  );
};
