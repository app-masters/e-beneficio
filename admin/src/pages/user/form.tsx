import { Alert, Checkbox, Form, Input, Modal, Select } from 'antd';
import { useFormik } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { InputFormatter } from '../../components/inputFormatter';
import { User } from '../../interfaces/user';
import { AppState } from '../../redux/rootReducer';
import { requestSaveUser } from '../../redux/user/actions';
import { formatCPF } from '../../utils/string';
import yup from '../../utils/yup';
import { roleList } from './../../utils/constraints';

const { Option } = Select;

const schema = yup.object().shape({
  name: yup.string().label('Nome').required(),
  password: yup
    .string()
    .label('Senha')
    .when('isCreating', (isCreating: boolean | null | undefined, schema: yup.StringSchema) =>
      isCreating ? schema.required() : schema
    ),
  cpf: yup.string().label('CPF').required(),
  email: yup.string().label('Email').required(),
  role: yup.string().label('Cargo').required(),
  isCreating: yup.boolean().label('CriandoUsuario').nullable()
});

/**
 * Dashboard page component
 * @param props component props
 */
export const UserForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const history = useHistory();
  const isCreating = props.match.params.id === 'criar';

  // Redux state
  const user = useSelector<AppState, User | undefined>(({ userReducer }) =>
    userReducer.list.find((item: User) => item.id === Number(props.match.params.id))
  );
  const loading = useSelector<AppState, boolean>(({ userReducer }) => userReducer.loading);

  // Redux actions
  const dispatch = useDispatch();

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
    setFieldTouched,
    getFieldProps
  } = useFormik({
    initialValues: user || {
      name: '',
      password: '',
      cpf: '',
      email: '',
      role: 'admin',
      active: false,
      isCreating
    },
    validationSchema: schema,
    onSubmit: (formikValues, { setStatus }) => {
      const values = { ...formikValues };
      // Prevent sending an empty password when editing an already existing user
      if (!isCreating && user && !values.password) values.password = user.password;

      setStatus();
      dispatch(
        requestSaveUser(
          values,
          () => history.push('/usuarios'),
          () => setStatus('Ocorreu um erro ao realizar a requisição.')
        )
      );
    }
  });

  const nameMeta = getFieldMeta('name');
  const passwordMeta = getFieldMeta('password');
  const cpfMeta = getFieldMeta('cpf');
  const emailMeta = getFieldMeta('email');
  const roleMeta = getFieldMeta('role');
  const activeMeta = getFieldMeta('active');
  const activeField = getFieldProps('active');

  return (
    <Modal
      title={isCreating ? 'Criar' : 'Editar'}
      visible={true}
      onCancel={() => history.push('/usuarios')}
      onOk={submitForm}
      confirmLoading={loading}
      okType={errors && Object.keys(errors).length > 0 && touched ? 'danger' : 'primary'}
    >
      {status && <Alert message="Erro no formulário" description={status} type="error" />}
      <form onSubmit={handleSubmit}>
        <Form layout="vertical">
          <Form.Item
            label={'Nome'}
            validateStatus={!!nameMeta.error && !!nameMeta.touched ? 'error' : ''}
            help={!!nameMeta.error && !!nameMeta.touched ? nameMeta.error : undefined}
          >
            <Input id="name" name="name" onChange={handleChange} value={values.name} onPressEnter={submitForm} />
          </Form.Item>

          <Form.Item
            label={'Email'}
            validateStatus={!!emailMeta.error && !!emailMeta.touched ? 'error' : ''}
            help={!!emailMeta.error && !!emailMeta.touched ? emailMeta.error : undefined}
          >
            <Input id="email" name="email" onChange={handleChange} value={values.email} onPressEnter={submitForm} />
          </Form.Item>

          <Form.Item
            label={'Senha'}
            validateStatus={!!passwordMeta.error && !!passwordMeta.touched ? 'error' : ''}
            help={!!passwordMeta.error && !!passwordMeta.touched ? passwordMeta.error : undefined}
          >
            <Input
              id="password"
              name="password"
              onChange={handleChange}
              value={passwordMeta.touched ? values.password : undefined}
              onPressEnter={submitForm}
            />
          </Form.Item>

          <Form.Item
            label={'CPF'}
            validateStatus={!!cpfMeta.error && !!cpfMeta.touched ? 'error' : ''}
            help={!!cpfMeta.error && !!cpfMeta.touched ? cpfMeta.error : undefined}
          >
            <InputFormatter
              id="cpf"
              name="cpf"
              onPressEnter={submitForm}
              value={formatCPF(values.cpf)}
              setValue={(value) => setFieldValue('cpf', value)}
              formatter={(value) => formatCPF(value?.toString())}
              parser={(value) => (value ? value.replace(/[./-]/g, '').trim() : '')}
            />
          </Form.Item>

          <Form.Item
            label={'Cargo'}
            validateStatus={!!roleMeta.error && !!roleMeta.touched ? 'error' : ''}
            help={!!roleMeta.error && !!roleMeta.touched ? roleMeta.error : undefined}
          >
            <Select
              defaultValue={values.role}
              onSelect={(value) => setFieldValue('role', value)}
              value={values.role || undefined}
              onChange={(value: string) => {
                setFieldValue('role', value);
              }}
              onBlur={() => {
                setFieldTouched('role', true);
              }}
            >
              {Object.keys(roleList).map((key) => (
                <Option key={key} value={key}>
                  {roleList[key].title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            validateStatus={!!activeMeta.error && !!activeMeta.touched ? 'error' : ''}
            help={!!activeMeta.error && !!activeMeta.touched ? activeMeta.error : undefined}
          >
            <Checkbox checked={values.active} {...activeField}>
              Ativo
            </Checkbox>
          </Form.Item>
        </Form>
      </form>
    </Modal>
  );
};
