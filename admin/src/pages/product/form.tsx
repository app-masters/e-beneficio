import React from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Product } from '../../interfaces/product';
import { AppState } from '../../redux/rootReducer';
import { useFormik } from 'formik';
import { Form, Modal, Alert, Input } from 'antd';
import yup from '../../utils/yup';
import { requestSaveProduct } from '../../redux/product/actions';

const schema = yup.object().shape({
  name: yup.string().label('Nome').required()
});

/**
 * Form Product component
 * @param props component props
 */
export const ProductForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const history = useHistory();
  const isCreating = props.match.params.id === 'criar';

  // Redux state
  const product = useSelector<AppState, Product | undefined>(({ productReducer }) =>
    productReducer.list.find((item: Product) => item.id === Number(props.match.params.id))
  );
  const loading = useSelector<AppState, boolean>(({ productReducer }) => productReducer.loading);

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
    setFieldTouched
  } = useFormik({
    initialValues: product || {
      name: ''
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      dispatch(
        requestSaveProduct(
          values,
          true,
          'insert',
          () => history.push('/produtos'),
          () => setStatus('Ocorreu um erro ao realizar a requisição.')
        )
      );
    }
  });

  const nameMeta = getFieldMeta('name');

  return (
    <Modal
      title={isCreating ? 'Criar' : 'Editar'}
      visible={true}
      onCancel={() => history.push('/produtos')}
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
        </Form>
      </form>
    </Modal>
  );
};
