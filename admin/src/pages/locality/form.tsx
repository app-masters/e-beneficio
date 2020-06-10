import { Alert, Form, Modal, Input, Select, Spin } from 'antd';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Locality } from '../../interfaces/locality';
import { AppState } from '../../redux/rootReducer';
import yup from '../../utils/yup';
import { requestGetEntity } from '../../redux/entity/actions';
import { Entity } from '../../interfaces/entity';
import { requestSaveLocality } from '../../redux/locality/actions';
import { InputFormatter } from '../../components/inputFormatter';
import { formatCNPJ } from '../../utils/string';

const { Option } = Select;

const schema = yup.object().shape({
  title: yup.string().label('Loja').required(),
  placeId: yup.number().label('Entidade').required(),
  cnpj: yup.string().label('CNPJ').required(),
  address: yup.string().label('Endereço').required()
});

/**
 * Dashboard page component
 * @param props component props
 */
export const LocalityForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const history = useHistory();
  const isCreating = props.match.params.id === 'criar';

  // Redux state
  const locality = useSelector<AppState, Locality | undefined>(({ localityReducer }) =>
    localityReducer.list.find((item: Locality) => item.id === Number(props.match.params.id))
  );
  const loading = useSelector<AppState, boolean>(({ localityReducer }) => localityReducer.loading);
  const entityLoading = useSelector<AppState, boolean>(({ entityReducer }) => entityReducer.loading);
  const entityList = useSelector<AppState, Entity[]>(({ entityReducer }) => entityReducer.list);

  // Redux actions
  const dispatch = useDispatch();
  useEffect(() => {
    if (!entityList || entityList.length <= 0) {
      dispatch(requestGetEntity());
    }
  }, [dispatch, entityList]);

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
    initialValues: locality || {
      placeId: !entityLoading && entityList && entityList.length > 0 ? entityList[0].id : -1,
      title: '',
      cnpj: '',
      address: ''
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      dispatch(
        requestSaveLocality(
          values,
          () => history.push('/localidades'),
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
      onCancel={() => history.push('/localidades')}
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
            label={'Entidade'}
            validateStatus={!!placeIdMeta.error && !!placeIdMeta.touched ? 'error' : ''}
            help={!!placeIdMeta.error && !!placeIdMeta.touched ? placeIdMeta.error : undefined}
          >
            <Select
              disabled={entityLoading}
              defaultValue={values.placeId?.toString()}
              onSelect={(value) => setFieldValue('placeId', Number(value))}
              value={values.placeId?.toString() || undefined}
              notFoundContent={entityLoading ? <Spin size="small" /> : null}
              onChange={(value: string) => {
                setFieldValue('placeId', Number(value));
              }}
              onBlur={() => {
                setFieldTouched('placeId', true);
              }}
            >
              {!entityLoading &&
                entityList &&
                entityList.length > 0 &&
                entityList.map((entity) => (
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
        </Form>
      </form>
    </Modal>
  );
};
