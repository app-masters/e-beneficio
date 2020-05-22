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
  title: yup.string().label('Nome').required()
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
    institutionReducer.list.find((item) => item.id === Number(props.match.params.id))
  );

  const loading = useSelector<AppState, boolean>(({ institutionReducer }) => institutionReducer.loading);

  const { handleSubmit, handleChange, values, getFieldMeta, submitForm, status, errors, touched } = useFormik({
    initialValues: institution || {
      title: ''
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
        </Form>
      </form>
    </Modal>
  );
};
