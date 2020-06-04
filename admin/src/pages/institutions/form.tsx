import { Alert, Form, Input, Modal } from 'antd';
import { useFormik } from 'formik';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { requestSaveInstitution } from '../../redux/institution/actions';
import { AppState } from '../../redux/rootReducer';
import yup from '../../utils/yup';
import { Institution } from '../../interfaces/institution';

const schema = yup.object().shape({
  title: yup.string().label('Nome').required(),
  address: yup.string().label('Endereço'),
  district: yup.string().label('Distrito')
});

/**
 * Dashboard page component
 * @param props component props
 */
export const InstitutionForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const history = useHistory();
  const isCreating = props.match.params.id === 'criar';
  const dispatch = useDispatch();

  // Redux state
  const institution = useSelector<AppState, Institution | undefined>(({ institutionReducer }) =>
    institutionReducer.list.find((item: Institution) => item.id === Number(props.match.params.id))
  );

  const loading = useSelector<AppState, boolean>(({ institutionReducer }) => institutionReducer.loading);

  const { handleSubmit, handleChange, values, getFieldMeta, submitForm, status, errors, touched } = useFormik({
    initialValues: institution || {
      title: '',
      address: '',
      district: ''
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      dispatch(
        requestSaveInstitution(
          values,
          () => history.push('/instituicoes'),
          () => setStatus('Ocorreu um erro ao realizar a requisição.')
        )
      );
    }
  });

  const titleMeta = getFieldMeta('title');
  const addressMeta = getFieldMeta('address');
  const districtMeta = getFieldMeta('district');

  return (
    <Modal
      title={isCreating ? 'Criar' : 'Editar'}
      visible={true}
      onCancel={() => history.push('/instituicoes')}
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
            label={'Distrito'}
            validateStatus={!!districtMeta.error && !!districtMeta.touched ? 'error' : ''}
            help={!!districtMeta.error && !!districtMeta.touched ? districtMeta.error : undefined}
          >
            <Input
              id="district"
              name="district"
              onChange={handleChange}
              value={values.district}
              onPressEnter={submitForm}
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
