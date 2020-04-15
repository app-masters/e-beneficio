import { Alert, Form, Modal, Input, Select, Spin } from 'antd';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { PlaceStore } from '../../interfaces/placeStore';
import { AppState } from '../../redux/rootReducer';
import yup from '../../utils/yup';
import { requestGetPlace } from '../../redux/place/actions';
import { Place } from '../../interfaces/place';
import { requestSavePlaceStore } from '../../redux/placeStore/actions';
import { InputFormatter } from '../../components/inputFormatter';
import { formatCNPJ } from '../../utils/string';
import { User } from '../../interfaces/user';

const { Option } = Select;

const schema = yup.object().shape({
  title: yup.string().label('Loja').required(),
  placeId: yup.number().label('Estabelecimento').required(),
  cnpj: yup.string().label('CNPJ').required(),
  address: yup.string().label('Endereço').required()
});

/**
 * Dashboard page component
 * @param props component props
 */
export const PlaceStoreForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const history = useHistory();
  const isCreating = props.match.params.id === 'criar';

  // Redux state
  const currentUser = useSelector<AppState, User>((state) => state.authReducer.user as User);
  const placeStore = useSelector<AppState, PlaceStore | undefined>(({ placeStoreReducer }) =>
    placeStoreReducer.list.find((item) => item.id === Number(props.match.params.id))
  );
  const loading = useSelector<AppState, boolean>(({ placeStoreReducer }) => placeStoreReducer.loading);
  const placeLoading = useSelector<AppState, boolean>(({ placeReducer }) => placeReducer.loading);
  const placeList = useSelector<AppState, Place[]>(({ placeReducer }) =>
    placeReducer.list.filter((f) => f.cityId === currentUser.cityId && f.id === currentUser.placeStoreId)
  );

  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    if (!placeList || placeList.length <= 0) {
      dispatch(requestGetPlace());
    }
  }, [dispatch, placeList]);

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
    initialValues: placeStore || {
      placeId: !placeLoading && placeList && placeList.length > 0 ? placeList[0].id : -1,
      title: '',
      cnpj: '',
      address: '',
      cityId: currentUser.cityId
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      dispatch(
        requestSavePlaceStore(
          values,
          () => history.push('/lojas'),
          () => setStatus('Ocorreu um erro ao realizar a requisição.')
        )
      );
    }
  });

  const titleMeta = getFieldMeta('title');
  const cnpjMeta = getFieldMeta('cnpj');
  const addressMeta = getFieldMeta('address');
  const placeIdMeta = getFieldMeta('placeId');

  return (
    <Modal
      title={isCreating ? 'Criar' : 'Editar'}
      visible={true}
      onCancel={() => history.push('/lojas')}
      onOk={submitForm}
      confirmLoading={loading}
      okType={errors && Object.keys(errors).length > 0 && touched ? 'danger' : 'primary'}
    >
      {status && <Alert message="Erro no formulário" description={status} type="error" />}
      <form onSubmit={handleSubmit}>
        <Form layout="vertical">
          <Form.Item
            label={'Loja'}
            validateStatus={!!titleMeta.error && !!titleMeta.touched ? 'error' : ''}
            help={!!titleMeta.error && !!titleMeta.touched ? titleMeta.error : undefined}
          >
            <Input id="title" name="title" onChange={handleChange} value={values.title} onPressEnter={submitForm} />
          </Form.Item>

          <Form.Item
            label={'Estabelecimento'}
            validateStatus={!!placeIdMeta.error && !!placeIdMeta.touched ? 'error' : ''}
            help={!!placeIdMeta.error && !!placeIdMeta.touched ? placeIdMeta.error : undefined}
          >
            <Select
              disabled={placeLoading}
              defaultValue={values.placeId?.toString()}
              onSelect={(value) => setFieldValue('placeId', Number(value))}
              value={values.placeId?.toString() || undefined}
              notFoundContent={placeLoading ? <Spin size="small" /> : null}
              onChange={(value: string) => {
                setFieldValue('placeId', Number(value));
              }}
              onBlur={() => {
                setFieldTouched('placeId', true);
              }}
            >
              {!placeLoading &&
                placeList &&
                placeList.length > 0 &&
                placeList.map((place) => (
                  <Option key={place.title} value={place.id?.toString() || '-1'}>
                    {place.title}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={'CNPJ'}
            validateStatus={!!cnpjMeta.error && !!cnpjMeta.touched ? 'error' : ''}
            help={!!cnpjMeta.error && !!cnpjMeta.touched ? cnpjMeta.error : undefined}
          >
            <InputFormatter
              id="cnpj"
              name="cnpj"
              onPressEnter={submitForm}
              value={formatCNPJ(values.cnpj)}
              setValue={(value) => setFieldValue('cnpj', value)}
              formatter={(value) => formatCNPJ(value?.toString())}
              parser={(value) => (value ? value.replace(/[./-]/g, '').trim() : '')}
            />
          </Form.Item>

          <Form.Item
            label={'Endereço'}
            validateStatus={!!addressMeta.error && !!addressMeta.touched ? 'error' : ''}
            help={!!addressMeta.error && !!addressMeta.touched ? addressMeta.error : undefined}
          >
            <Input
              id="address"
              name="address"
              onChange={handleChange}
              value={values.address}
              onPressEnter={submitForm}
            />
          </Form.Item>
        </Form>
      </form>
    </Modal>
  );
};
