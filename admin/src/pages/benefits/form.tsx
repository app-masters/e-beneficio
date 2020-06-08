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

const { Option } = Select;

const schema = yup.object().shape({
  institutionId: yup.number().label('Instituição').required(),
  groupName: yup.string().label('Família').required(),
  title: yup.string().label('Nome').required(),
  date: yup.date().label('Data').required(),
  value: yup.string().label('Valor').required()
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
      date: undefined,
      value: undefined
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
  const dateMeta = getFieldMeta('year');
  const valueMeta = getFieldMeta('value');
  const institutionIdMeta = getFieldMeta('institutionId');

  const monthFormat = 'MM/YYYY';

  return (
    <Modal
      title={isCreating ? 'Criar' : 'Editar'}
      visible={true}
      onCancel={() => history.push('/beneficios')}
      onOk={submitForm}
      confirmLoading={loading}
      okType={errors && Object.keys(errors).length > 0 && touched ? 'danger' : 'primary'}
    >
      {status && <Alert message="Erro no formulário" description={status} type="error" />}
      <form onSubmit={handleSubmit}>
        <Form layout="vertical">
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

          <Form.Item
            label={'Data'}
            validateStatus={!!dateMeta.error && !!dateMeta.touched ? 'error' : ''}
            help={!!dateMeta.error && !!dateMeta.touched ? dateMeta.error : undefined}
          >
            <DatePicker
              locale={locale}
              picker="month"
              style={{ width: '100%' }}
              format={monthFormat}
              defaultValue={values.date ? moment(values.date) : undefined}
              onChange={(date) => {
                setFieldValue('date', date);
              }}
            />
          </Form.Item>

          <Form.Item
            label="Valor por dependente"
            validateStatus={!!valueMeta.error && !!valueMeta.touched ? 'error' : ''}
            help={!!valueMeta.error && !!valueMeta.touched ? valueMeta.error : undefined}
          >
            <Input id="value" name="value" prefix="R$" onChange={handleChange} value={values.value} />
          </Form.Item>
        </Form>
      </form>
    </Modal>
  );
};
