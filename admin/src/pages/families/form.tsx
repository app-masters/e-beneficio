import React from 'react';
import { Modal, Form, Input, DatePicker, Select, Alert } from 'antd';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import yup from '../../utils/yup';
import { Family } from '../../interfaces/family';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../../redux/rootReducer';
import { familyGroupList } from '../../utils/constraints';
import locale from 'antd/es/date-picker/locale/pt_BR';
import { requestSaveFamily } from '../../redux/families/actions';
import { useFormik } from 'formik';
import moment from 'moment';

const schema = yup.object().shape({
  code: yup.string().label('Código').required(),
  groupName: yup.string().label('Grupo familiar').required(),
  responsibleName: yup.string().label('Nome do responsável').required(),
  responsibleNis: yup.string().label('NIS do responsável').required(),
  responsibleBirthday: yup.date().label('Nascimento do responsável').required(),
  responsibleMotherName: yup.string().label('Nome da mãe do responsável').required()
});

const { Option } = Select;

const typeFamily = {
  code: '',
  groupName: '',
  responsibleName: '',
  responsibleNis: '',
  responsibleBirthday: '',
  responsibleMotherName: ''
};

/**
 * Form family component
 * @param props component props
 */
export const FamilyForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const isCreating = props.match.params.id === 'criar';

  // Redux state
  const family = useSelector<AppState, Family | null | undefined>(({ familiesReducer }) => familiesReducer.familyItem);

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
    initialValues: !isCreating ? family || typeFamily : typeFamily,
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      // alert(JSON.stringify(values));
      dispatch(
        requestSaveFamily(
          values,
          () => history.push('/familias'),
          () => setStatus('Ocorreu um erro ao realizar a requisição.')
        )
      );
    }
  });

  const codeMeta = getFieldMeta('code');
  const groupNameMeta = getFieldMeta('groupName');
  const responsibleNameMeta = getFieldMeta('responsibleName');
  const responsibleNisMeta = getFieldMeta('responsibleNis');
  const responsibleBirthdayMeta = getFieldMeta('responsibleBirthday');
  const responsibleMotherNameMeta = getFieldMeta('responsibleMotherName');

  return (
    <Modal
      title={isCreating ? 'Criar' : 'Editar'}
      onOk={submitForm}
      visible={true}
      onCancel={() => history.push('/familias')}
      okType={errors && Object.keys(errors).length > 0 && touched ? 'danger' : 'primary'}
    >
      {status && <Alert message="Erro no formulário" description={status} type="error" />}
      <form onSubmit={handleSubmit}>
        <label>{JSON.stringify(errors)}</label>
        <Form layout="vertical">
          <Form.Item
            label={'Código'}
            validateStatus={!!codeMeta.error && !!codeMeta.touched ? 'error' : ''}
            help={!!codeMeta.error && !!codeMeta.touched ? codeMeta.error : undefined}
          >
            <Input
              id="code"
              maxLength={11}
              name="code"
              onChange={handleChange}
              value={values.code}
              onPressEnter={submitForm}
            />
          </Form.Item>
          <Form.Item
            label={'Grupo familiar'}
            validateStatus={!!groupNameMeta.error && !!groupNameMeta.touched ? 'error' : ''}
            help={!!groupNameMeta.error && !!groupNameMeta.touched ? groupNameMeta.error : undefined}
          >
            <Select
              defaultValue={values.groupName?.toString()}
              onSelect={(value) => setFieldValue('groupName', value)}
              value={values.groupName?.toString() || undefined}
              onChange={(value: string) => {
                setFieldValue('groupName', value);
              }}
              onBlur={() => {
                setFieldTouched('groupName', true);
              }}
            >
              {Object.keys(familyGroupList).map((item) => (
                <Option key={item} value={item}>
                  {familyGroupList[item].title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={'Nome do responsável'}
            validateStatus={!!responsibleNameMeta.error && !!responsibleNameMeta.touched ? 'error' : ''}
            help={!!responsibleNameMeta.error && !!responsibleNameMeta.touched ? responsibleNameMeta.error : undefined}
          >
            <Input
              id="responsibleName"
              name="responsibleName"
              onChange={handleChange}
              value={values.responsibleName}
              onPressEnter={submitForm}
            />
          </Form.Item>
          <Form.Item
            label={'NIS do responsável'}
            validateStatus={!!responsibleNisMeta.error && !!responsibleNisMeta.touched ? 'error' : ''}
            help={!!responsibleNisMeta.error && !!responsibleNisMeta.touched ? responsibleNisMeta.error : undefined}
          >
            <Input
              id="responsibleNis"
              name="responsibleNis"
              maxLength={11}
              onChange={handleChange}
              value={values.responsibleNis}
              onPressEnter={submitForm}
            />
          </Form.Item>
          <Form.Item
            label={'Nascimento do responsável'}
            validateStatus={!!responsibleBirthdayMeta.error && !!responsibleBirthdayMeta.touched ? 'error' : ''}
            help={
              !!responsibleBirthdayMeta.error && !!responsibleBirthdayMeta.touched
                ? responsibleBirthdayMeta.error
                : undefined
            }
          >
            <DatePicker
              name="responsibleBirthday"
              format={'DD/MM/YYYY'}
              defaultValue={values.responsibleBirthday ? moment(values.responsibleBirthday) : undefined}
              locale={locale}
              onChange={(date) => {
                setFieldValue('responsibleBirthday', date);
              }}
            />
          </Form.Item>
          <Form.Item
            label={'Nome da mãe do responsável'}
            validateStatus={!!responsibleMotherNameMeta.error && !!responsibleMotherNameMeta.touched ? 'error' : ''}
            help={
              !!responsibleMotherNameMeta.error && !!responsibleMotherNameMeta.touched
                ? responsibleMotherNameMeta.error
                : undefined
            }
          >
            <Input
              id="responsibleMotherName"
              name="responsibleMotherName"
              onChange={handleChange}
              value={values.responsibleMotherName}
              onPressEnter={submitForm}
            />
          </Form.Item>
        </Form>
      </form>
    </Modal>
  );
};
