import { Alert, Form, Modal, Input, Select, Spin, Divider } from 'antd';
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
import { formatCNPJ, formatPhone } from '../../utils/string';
import { env } from '../../env';

// Application consumption type
const consumptionType = env.REACT_APP_CONSUMPTION_TYPE as 'ticket' | 'product';

const { Option } = Select;

const schema = yup.object().shape({
  title: yup.string().label('Nome').required(),
  placeId: yup.number().label('Grupo da Entidade').required(),
  address: yup.string().label('Endereço').required(),
  responsibleName: yup.string().label('Nome do responsável'),
  responsiblePhone: yup.string().label('Telefone do responsável'),
  responsibleEmail: yup.string().label('Email do responsável')
});

/**
 * Dashboard page component
 * @param props component props
 */
export const PlaceStoreForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const history = useHistory();
  const isCreating = props.match.params.id === 'criar';
  const storeLabel = consumptionType !== 'product' ? 'Entidade' : 'Grupo de entidades';

  // Redux state
  const placeStore = useSelector<AppState, PlaceStore | undefined>(({ placeStoreReducer }) =>
    placeStoreReducer.list.find((item: PlaceStore) => item.id === Number(props.match.params.id))
  );
  const loading = useSelector<AppState, boolean>(({ placeStoreReducer }) => placeStoreReducer.loading);
  const placeLoading = useSelector<AppState, boolean>(({ placeReducer }) => placeReducer.loading);
  const placeList = useSelector<AppState, Place[]>(({ placeReducer }) => placeReducer.list);

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
      responsibleName: '',
      responsiblePhone: '',
      responsibleEmail: ''
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      dispatch(
        requestSavePlaceStore(
          values,
          () => history.push('/entidades'),
          () => setStatus('Ocorreu um erro ao realizar a requisição.')
        )
      );
    }
  });

  const titleMeta = getFieldMeta('title');
  const cnpjMeta = getFieldMeta('cnpj');
  const addressMeta = getFieldMeta('address');
  const responsibleNameMeta = getFieldMeta('responsibleName');
  const responsiblePhoneMeta = getFieldMeta('responsiblePhone');
  const responsibleEmailMeta = getFieldMeta('responsibleEmail');
  const placeIdMeta = getFieldMeta('placeId');

  return (
    <Modal
      title={isCreating ? 'Criar' : 'Editar'}
      visible={true}
      onCancel={() => history.push('/entidades')}
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
            label={storeLabel}
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
                placeList.map((entity) => (
                  <Option key={entity.title} value={entity.id?.toString() || '-1'}>
                    {entity.title}
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
          <Divider />
          <Form.Item
            label={'Nome do responsável'}
            validateStatus={!!responsibleNameMeta.error && !!responsibleNameMeta.touched ? 'error' : ''}
            help={!!responsibleNameMeta.error && !!responsibleNameMeta.touched ? responsibleNameMeta.error : undefined}
          >
            <InputFormatter
              id="responsibleName"
              name="responsibleName"
              onPressEnter={submitForm}
              value={values.responsibleName}
              setValue={(value) => setFieldValue('responsibleName', value)}
              formatter={(value) => value}
              parser={(value) => value}
            />
          </Form.Item>
          <Form.Item
            label={'Telefone do responsável'}
            validateStatus={!!responsiblePhoneMeta.error && !!responsiblePhoneMeta.touched ? 'error' : ''}
            help={
              !!responsiblePhoneMeta.error && !!responsiblePhoneMeta.touched ? responsiblePhoneMeta.error : undefined
            }
          >
            <InputFormatter
              id="responsiblePhone"
              name="responsiblePhone"
              onPressEnter={submitForm}
              value={values.responsiblePhone}
              setValue={(value) => setFieldValue('responsiblePhone', value)}
              formatter={(value) => formatPhone(value?.toString())}
              parser={(value) => (value ? value.replace(/[^\w\s]/gi, '').trim() : '')}
            />
          </Form.Item>
          <Form.Item
            label={'Email do responsável'}
            validateStatus={!!responsibleEmailMeta.error && !!responsibleEmailMeta.touched ? 'error' : ''}
            help={
              !!responsibleEmailMeta.error && !!responsibleEmailMeta.touched ? responsibleEmailMeta.error : undefined
            }
          >
            <InputFormatter
              id="responsibleEmail"
              name="responsibleEmail"
              onPressEnter={submitForm}
              value={values.responsibleEmail}
              setValue={(value) => setFieldValue('responsibleEmail', value)}
            />
          </Form.Item>
        </Form>
      </form>
    </Modal>
  );
};
