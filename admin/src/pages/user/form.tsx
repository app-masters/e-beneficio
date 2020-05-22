import { Alert, Checkbox, Form, Input, Modal, Select, Spin } from 'antd';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { InputFormatter } from '../../components/inputFormatter';
import { Place } from '../../interfaces/place';
import { PlaceStore } from '../../interfaces/placeStore';
import { User } from '../../interfaces/user';
import { requestGetPlace } from '../../redux/place/actions';
import { requestGetPlaceStore } from '../../redux/placeStore/actions';
import { AppState } from '../../redux/rootReducer';
import { requestSaveUser } from '../../redux/user/actions';
import { formatCPF } from '../../utils/string';
import yup from '../../utils/yup';
import { roleList } from './../../utils/constraints';

const { Option } = Select;

const schema = yup.object().shape({
  placeStoreId: yup.number().label('Loja').required(),
  name: yup.string().label('Nome').required(),
  password: yup.string().label('Senha').required(),
  cpf: yup.string().label('CPF').required(),
  email: yup.string().label('Email').required(),
  role: yup.string().label('Cargo').required()
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
    userReducer.list.find((item) => item.id === Number(props.match.params.id))
  );
  const loading = useSelector<AppState, boolean>(({ userReducer }) => userReducer.loading);
  const placeStoreLoading = useSelector<AppState, boolean>(({ placeStoreReducer }) => placeStoreReducer.loading);
  const placeStoreList = useSelector<AppState, PlaceStore[]>(({ placeStoreReducer }) => placeStoreReducer.list);
  const placeList = useSelector<AppState, Place[]>(({ placeReducer }) => placeReducer.list);

  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    if (!placeStoreList || placeStoreList.length <= 0) {
      dispatch(requestGetPlaceStore());
    }

    if (!placeList || placeList.length <= 0) {
      dispatch(requestGetPlace());
    }
  }, [dispatch, placeStoreList, placeList]);

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
      placeStoreId: !placeStoreLoading && placeStoreList && placeStoreList.length > 0 ? placeStoreList[0].id : -1,
      name: '',
      password: '',
      cpf: '',
      email: '',
      role: 'admin',
      active: false
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
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
  const placeStoreMeta = getFieldMeta('placeStoreId');
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

          {isCreating && (
            <Form.Item
              label={'Senha'}
              validateStatus={!!passwordMeta.error && !!passwordMeta.touched ? 'error' : ''}
              help={!!passwordMeta.error && !!passwordMeta.touched ? passwordMeta.error : undefined}
            >
              <Input
                id="password"
                name="password"
                onChange={handleChange}
                value={values.password}
                onPressEnter={submitForm}
              />
            </Form.Item>
          )}

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
            label={'Loja'}
            validateStatus={!!placeStoreMeta.error && !!placeStoreMeta.touched ? 'error' : ''}
            help={!!placeStoreMeta.error && !!placeStoreMeta.touched ? placeStoreMeta.error : undefined}
          >
            <Select
              disabled={placeStoreLoading}
              defaultValue={values.placeStoreId?.toString()}
              onSelect={(value) => setFieldValue('placeStoreId', Number(value))}
              value={values.placeStoreId?.toString() || undefined}
              notFoundContent={placeStoreLoading ? <Spin size="small" /> : null}
              onChange={(value: string) => {
                setFieldValue('placeStoreId', Number(value));
              }}
              onBlur={() => {
                setFieldTouched('placeStoreId', true);
              }}
            >
              {!placeStoreLoading &&
                placeStoreList &&
                placeStoreList.length > 0 &&
                placeStoreList.map((placeStore) => (
                  <Option key={placeStore.id} value={placeStore.id?.toString() || '-1'}>
                    {placeList && placeList.length > 0
                      ? `${placeList.find((place) => place.id === placeStore.placeId)?.title} - `
                      : ''}
                    {placeStore.title}
                  </Option>
                ))}
            </Select>
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
