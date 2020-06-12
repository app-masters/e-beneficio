import React from 'react';
import { Form, Modal, Alert, Input } from 'antd';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { useFormik } from 'formik';
import yup from '../../utils/yup';
import { formHelper, formValidation } from '../../utils/constraints';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../../redux/rootReducer';
import { Group } from '../../interfaces/group';
import { requestSaveGroup } from '../../redux/group/actions';

const schema = yup.object().shape({
  title: yup.string().label('Nome').required()
});

/**
 * Group form component
 * @param props component props
 */
export const GroupForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const history = useHistory();
  const isCreating = props.match.params.id === 'criar';

  const dispatch = useDispatch();

  const group = useSelector<AppState, Group | undefined>(({ groupReducer }) =>
    groupReducer.list.find((f) => f.id === Number(props.match.params.id))
  );
  const loading = useSelector<AppState, boolean>(({ groupReducer }) => groupReducer.loading);
  const error = useSelector<AppState, Error | undefined>(({ groupReducer }) => groupReducer.error);

  const { handleChange, values, getFieldMeta, submitForm, status, errors, touched } = useFormik({
    initialValues: group || {
      title: ''
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      dispatch(requestSaveGroup(values));
    }
  });

  const titleMeta = getFieldMeta('title');

  return (
    <Modal
      title={isCreating ? 'Criar' : 'Editar'}
      visible={true}
      onCancel={() => history.push('/grupos')}
      onOk={submitForm}
      confirmLoading={loading}
      okType={errors && Object.keys(errors).length > 0 && touched ? 'danger' : 'primary'}
    >
      {(status || error) && <Alert message="Erro no formulário" description={status || error?.message} type="error" />}
      <Form layout="vertical">
        <Form.Item label={'Titulo'} validateStatus={formValidation(titleMeta)} help={formHelper(titleMeta)}>
          <Input id="title" name="title" onChange={handleChange} value={values.title} onPressEnter={submitForm} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
