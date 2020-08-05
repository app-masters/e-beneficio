import React from 'react';
import {
  Col,
  Row,
  Form,
  Input,
  DatePicker,
  Card,
  Typography,
  List,
  Button,
  PageHeader,
  Modal,
  Divider,
  Alert
} from 'antd';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import yup from '../../../utils/yup';
import { useFormik } from 'formik';
import locale from 'antd/es/date-picker/locale/pt_BR';
import moment from 'moment';
import { PageContainer, ActionWrapper } from './styles';
import { Dependent } from '../../../interfaces/dependent';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Family } from '../../../interfaces/family';
import { AppState } from '../../../redux/rootReducer';
import { formHelper, formValidation } from '../../../utils/constraints';
import { requestSaveFamily, requestGetFamily } from '../../../redux/families/actions';

const schema = yup.object().shape({
  responsibleName: yup.string().label('Nome do responsável').required(),
  responsibleNis: yup.string().label('NIS do responsável').required()
});

const typeFamily = {
  responsibleNis: '',
  responsibleName: '',
  groupId: 1,
  dependents: []
};

/**
 * Families form component
 * @param props component props
 */
export const FamiliesForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const isCreating = !!!props.match.params.id;
  const [modal, setModal] = React.useState<{
    item?: Dependent | null;
    open: boolean;
  }>({
    open: false
  });

  const history = useHistory();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (props.match.params.id) {
      dispatch(requestGetFamily(undefined, undefined, props.match.params.id));
    } else {
      history.push('/families/list');
    }
  }, [history, dispatch, props]);

  const family = useSelector<AppState, Family | null | undefined>(({ familiesReducer }) =>
    familiesReducer.list?.find((f: Family) => f.id === Number(props.match.params.id))
  );

  React.useEffect(() => {
    if (!isCreating && !family) {
      history.push('/familias/lista');
    }
  }, [isCreating, family, history]);

  const loading = useSelector<AppState, boolean>(({ familiesReducer }) => familiesReducer.familyLoading);
  const error = useSelector<AppState, Error | string | undefined>(
    ({ familiesReducer }) => familiesReducer.familySaveError
  );

  const { handleSubmit, handleChange, values, getFieldMeta, submitForm, setFieldValue } = useFormik({
    initialValues: family || typeFamily,
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      console.log(values);
      const newFamily = {
        ...values,
        code: values.responsibleNis
      };
      dispatch(
        requestSaveFamily(
          newFamily as Family,
          () => {
            Modal.success({ title: 'Família salva com sucesso', onOk: () => history.push('/familias/lista') });
          },
          () => setStatus('Ocorreu um erro ao salvar a família.')
        )
      );
    }
  });

  /**
   * Handle responsible
   */
  const addToList = (value: Dependent) => {
    let list: Dependent[] = values.dependents ? [...values.dependents] : [];
    const verifyIndex = list.findIndex((f) => f.nis === value.nis || f.name === value.name);
    if (verifyIndex > -1) list = list.filter((f) => f.nis !== value.nis && f.name !== value.name);
    list.push(value);
    return list;
  };

  /**
   * Remove dependent form component
   */
  const removeDependent = (nis?: string, id?: number | string) => {
    let list = values.dependents;
    if (nis) list = values.dependents?.filter((f: Dependent) => f.nis !== nis);
    else if (id) list = values.dependents?.filter((f: Dependent) => f.id !== Number(id));
    setFieldValue('dependents', list);
  };

  const responsibleNameMeta = getFieldMeta('responsibleName');
  const responsibleNisMeta = getFieldMeta('responsibleNis');

  return (
    <PageContainer>
      <Card
        loading={loading}
        title={<Typography.Title>{`${isCreating ? 'Nova' : 'Editar'} Família`}</Typography.Title>}
      >
        <Form onSubmitCapture={handleSubmit} layout="vertical">
          {error && <Alert message="Ocorreu um erro" description={(error as Error).message} type="error" showIcon />}
          <Row gutter={[16, 16]}>
            <Col span={24} md={12}>
              <Form.Item
                label={'Nome do responsável'}
                validateStatus={formValidation(responsibleNameMeta)}
                help={formHelper(responsibleNameMeta)}
              >
                <Input
                  id="responsibleName"
                  name="responsibleName"
                  onChange={handleChange}
                  value={values.responsibleName}
                  onPressEnter={submitForm}
                />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                label={'Nis do responsável'}
                validateStatus={formValidation(responsibleNisMeta)}
                help={formHelper(responsibleNisMeta)}
              >
                <Input
                  id="responsibleNis"
                  name="responsibleNis"
                  onChange={handleChange}
                  value={values.responsibleNis}
                  onPressEnter={submitForm}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <PageHeader
            title={<Typography.Text>Dependentes</Typography.Text>}
            style={{ padding: 0, paddingBottom: 20 }}
            extra={<Button onClick={() => setModal({ open: true })}>Adicionar dependente</Button>}
          />
          <List
            dataSource={values.dependents}
            itemLayout="horizontal"
            locale={{ emptyText: 'Nenhum membro cadastrado' }}
            renderItem={(item: Dependent) => (
              <List.Item
                actions={[
                  <Button
                    key={'edit'}
                    onClick={() => {
                      setModal({
                        open: true,
                        item
                      });
                    }}
                  >
                    Editar
                  </Button>,
                  !item.id && (
                    <Button
                      key={'remove'}
                      danger
                      onClick={() =>
                        Modal.confirm({
                          title: 'Você realmente quer deletar esse registro?',
                          icon: <ExclamationCircleOutlined />,
                          okText: 'Sim',
                          okType: 'danger',
                          cancelText: 'Não',
                          onOk: () => removeDependent(item.nis, item.id)
                        })
                      }
                    >
                      Remover
                    </Button>
                  )
                ]}
                style={{ paddingBottom: 0 }}
              >
                <List.Item.Meta
                  title={<>{`${item.name}`}</>}
                  description={
                    <Row gutter={[16, 16]}>
                      <Col span={24} md={12}>
                        <Row>{item.nis && `NIS: ${item.nis || ''}`}</Row>
                        <Row>{item.schoolName && `Escola: ${item.schoolName || ''}`}</Row>
                      </Col>
                    </Row>
                  }
                />
              </List.Item>
            )}
          />
          <Divider />
          <ActionWrapper>
            <Button htmlType={'submit'} loading={loading} type={'primary'}>
              Concluir
            </Button>
          </ActionWrapper>
        </Form>
      </Card>
      {modal.open && (
        <DependentForm
          item={modal.item}
          onClose={() => setModal({ open: false })}
          onEdit={(value: Dependent) => {
            const list = addToList(value);
            setFieldValue('dependents', list);
            setModal({ open: false });
          }}
          onCreate={(value: Dependent) => {
            const list = addToList(value);
            setFieldValue('dependents', list);
            setModal({ open: false });
          }}
        />
      )}
    </PageContainer>
  );
};

const schemaDependent = yup.object().shape({
  name: yup.string().label('Nome').required(),
  nis: yup.string().label('NIS do dependente').required(),
  birthday: yup.date().label('Nascimento').required(),
  schoolName: yup.string().label('Nome da escola').required()
});

const typeDependent = {
  name: '',
  schoolName: '',
  birthday: undefined,
  nis: ''
};

/**
 * Dependent form component
 * @param props component props
 */
export const DependentForm: React.FC<{
  item?: Dependent | null;
  onEdit: (item: Dependent) => void;
  onCreate: (item: Dependent) => void;
  onClose: () => void;
}> = ({ onClose, onEdit, onCreate, item }) => {
  const isCreating = !!!item;

  const { handleChange, values, errors, touched, getFieldMeta, submitForm, setFieldValue, getFieldProps } = useFormik({
    initialValues: item
      ? item
      : {
          ...typeDependent
        },
    validationSchema: schemaDependent,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      if (item) onEdit(values as Dependent);
      else onCreate(values as Dependent);
    }
  });

  const nameMeta = getFieldMeta('name');
  const schoolNameMeta = getFieldMeta('schoolName');
  const birthdayMeta = getFieldMeta('birthday');
  const nisMeta = getFieldMeta('nis');

  return (
    <Modal
      visible={true}
      title={isCreating ? 'Criar' : 'Editar'}
      onOk={submitForm}
      onCancel={onClose}
      okType={errors && Object.keys(errors).length > 0 && touched ? 'danger' : 'primary'}
    >
      <Form layout="vertical">
        <Form.Item label={'Nome'} validateStatus={formValidation(nameMeta)} help={formHelper(nameMeta)}>
          <Input id="name" name="name" onChange={handleChange} value={values.name} onPressEnter={submitForm} />
        </Form.Item>
        <Form.Item label={'Nascimento'} validateStatus={formValidation(birthdayMeta)} help={formHelper(birthdayMeta)}>
          <DatePicker
            name="birthday"
            format={'DD/MM/YYYY'}
            defaultValue={values.birthday ? moment(values.birthday) : undefined}
            locale={locale}
            onChange={(date) => {
              setFieldValue('birthday', date);
            }}
          />
        </Form.Item>
        <Form.Item label={'NIS do dependente'} validateStatus={formValidation(nisMeta)} help={formHelper(nisMeta)}>
          <Input id="nis" name="nis" onChange={handleChange} value={values.nis} onPressEnter={submitForm} />
        </Form.Item>
        <Form.Item
          label={'Nome da escola'}
          validateStatus={formValidation(schoolNameMeta)}
          help={formHelper(schoolNameMeta)}
        >
          <Input
            id="schoolName"
            name="schoolName"
            onChange={handleChange}
            value={values.schoolName}
            onPressEnter={submitForm}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
