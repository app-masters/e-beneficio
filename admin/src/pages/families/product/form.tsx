import React from 'react';
import {
  Col,
  Row,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Card,
  Typography,
  List,
  Button,
  PageHeader,
  Modal,
  InputNumber,
  Divider,
  Alert
} from 'antd';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import yup from '../../../utils/yup';
import { useFormik } from 'formik';
import { formatPhone, formatRG, formatCPF, formatMoney } from '../../../utils/string';
import locale from 'antd/es/date-picker/locale/pt_BR';
import moment from 'moment';
import { PageContainer, ColCheckStyle, ActionWrapper } from './styles';
import { Dependent } from '../../../interfaces/dependent';
import { ExclamationCircleOutlined } from '@ant-design/icons';
// import { requestSaveFamily } from '../../../redux/family/actions';
import { useDispatch, useSelector } from 'react-redux';
import { Family } from '../../../interfaces/family';
import { AppState } from '../../../redux/rootReducer';
import { Flex } from '../../../components/flex';
import { formHelper, formValidation } from '../../../utils/constraints';
import { requestGetPlaceStore } from '../../../redux/placeStore/actions';
import { PlaceStore } from '../../../interfaces/placeStore';
import { requestSaveFamily } from '../../../redux/families/actions';
import { Group } from '../../../interfaces/group';
import { requestGetGroup } from '../../../redux/group/actions';
// import { requestGetGroup } from '../../../redux/group/actions';
// import { Group } from '../../../interfaces/group';

const schema = yup.object().shape({
  groupId: yup.string().label('Grupo familiar').required(),
  placeStoreId: yup.string().label('Entidade').required()
});

const typeFamily = {
  code: '',
  cityId: '',
  groupId: '',
  placeStoreId: '',
  isRegisteredInPerson: undefined,
  totalSalary: undefined,
  isOnAnotherProgram: undefined,
  isOnGovernProgram: undefined,
  address: undefined,
  houseType: undefined,
  numberOfRooms: undefined,
  haveSewage: undefined,
  sewageComment: undefined,
  balance: undefined,
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
    type: string | 'adult' | 'child';
  }>({
    open: false,
    type: ''
  });

  const history = useHistory();
  const dispatch = useDispatch();

  const family = useSelector<AppState, Family | null | undefined>(({ familiesReducer }) =>
    familiesReducer.list?.find((f: Family) => f.id === Number(props.match.params.id))
  );

  const placeStore = useSelector<AppState, PlaceStore[]>(
    ({ placeStoreReducer }) => placeStoreReducer.list as PlaceStore[]
  );

  React.useEffect(() => {
    dispatch(requestGetGroup());
  }, [dispatch]);

  React.useEffect(() => {
    if (placeStore.length === 0) dispatch(requestGetPlaceStore());
  }, [placeStore, dispatch]);

  React.useEffect(() => {
    if (!isCreating && !family) {
      history.push('/familias');
    }
  }, [isCreating, family, history]);

  const loading = useSelector<AppState, boolean>(({ familiesReducer }) => familiesReducer.familyLoading);
  const error = useSelector<AppState, Error | string | undefined>(
    ({ familiesReducer }) => familiesReducer.familySaveError
  );

  const groups = useSelector<AppState, Group[]>(({ groupReducer }) => groupReducer.list as Group[]);

  const {
    handleSubmit,
    handleChange,
    values,
    getFieldMeta,
    submitForm,
    setFieldValue,
    setFieldTouched,
    getFieldProps
  } = useFormik({
    initialValues: family || typeFamily,
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      const newFamily = {
        ...values,
        balance: 0,
        dependents: values.dependents
          ? (values.dependents as Dependent[]).map((item) => {
              return { ...item, nis: undefined };
            })
          : undefined
      };
      dispatch(
        requestSaveFamily(
          newFamily as Family,
          () => {
            Modal.success({ title: 'Família salva com sucesso', onOk: () => history.push('/familias') });
          },
          () => setStatus('Ocorreu um erro ao salvar a família.')
        )
      );
    }
  });

  /**
   * Remove dependent form component
   */
  const removeDependent = (nis?: string, id?: number | string) => {
    let list = values.dependents;
    if (nis) list = values.dependents?.filter((f: Dependent) => f.nis !== nis);
    else if (id) list = values.dependents?.filter((f: Dependent) => f.id !== Number(id));
    setFieldValue('dependents', list);
  };

  /**
   * Handle responsible
   */
  const responsibleDependent = (value: Dependent) => {
    let list: Dependent[] = values.dependents ? [...values.dependents] : [];
    const verifyIndex = list.findIndex((f) => f.nis === value.nis);
    if (verifyIndex > -1) list = list.filter((f) => f.nis !== value.nis);
    if (value.isResponsible) {
      list = list.map((resp: Dependent) => {
        return { ...resp, isResponsible: false };
      });
      list.unshift(value);
    } else {
      list.push(value);
    }
    return list;
  };

  const groupIdMeta = getFieldMeta('groupId');
  const placeStoreIdMeta = getFieldMeta('placeStoreId');

  const isRegisteredInPersonMeta = getFieldMeta('isRegisteredInPerson');
  const isRegisteredInPersonField = getFieldProps('isRegisteredInPerson');
  const totalSalaryMeta = getFieldMeta('totalSalary');
  const isOnAnotherProgramMeta = getFieldMeta('isOnAnotherProgram');
  const isOnAnotherProgramField = getFieldProps('isOnAnotherProgram');
  const isOnGovernProgramMeta = getFieldMeta('isOnGovernProgram');
  const isOnGovernProgramField = getFieldProps('isOnGovernProgram');
  const addressMeta = getFieldMeta('address');
  const houseTypeMeta = getFieldMeta('houseType');
  const numberOfRoomsMeta = getFieldMeta('numberOfRooms');
  const haveSewageMeta = getFieldMeta('haveSewage');
  const haveSewageField = getFieldProps('haveSewage');
  const sewageCommentMeta = getFieldMeta('sewageComment');

  return (
    <PageContainer>
      <Card
        loading={loading}
        title={<Typography.Title>{`${isCreating ? 'Nova' : 'Editar'} Família`}</Typography.Title>}
      >
        <Form onSubmitCapture={handleSubmit} layout="vertical">
          {error && <Alert message="Ocorreu um erro" description={(error as Error).message} type="error" showIcon />}
          <Row gutter={[16, 16]}>
            <Col span={24} md={8}>
              <Form.Item
                label={'Grupo familiar'}
                validateStatus={formValidation(groupIdMeta)}
                help={formHelper(groupIdMeta)}
              >
                <Select
                  defaultValue={values.groupId?.toString()}
                  onSelect={(value) => setFieldValue('groupId', value)}
                  value={values.groupId?.toString() || undefined}
                  onChange={(value: string) => {
                    setFieldValue('groupId', value);
                  }}
                  onBlur={() => {
                    setFieldTouched('groupId', true);
                  }}
                >
                  {groups.map((item: Group) => (
                    <Select.Option key={item.id} value={Number(item.id).toString()}>
                      {item.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} md={8} style={ColCheckStyle}>
              <Flex alignItems="flex-end" justifyContent="center" style={{ width: '100%', height: '100%' }}>
                <Form.Item
                  validateStatus={formValidation(isOnGovernProgramMeta)}
                  help={formHelper(isOnGovernProgramMeta)}
                >
                  <Checkbox checked={values.isOnGovernProgram} {...isOnGovernProgramField}>
                    Família registrada no Bolsa Família
                  </Checkbox>
                </Form.Item>
              </Flex>
            </Col>
            <Col span={24} md={8} style={ColCheckStyle}>
              <Flex alignItems="flex-end" justifyContent="center" style={{ width: '100%', height: '100%' }}>
                <Form.Item
                  validateStatus={formValidation(isOnAnotherProgramMeta)}
                  help={formHelper(isOnAnotherProgramMeta)}
                >
                  <Checkbox checked={values.isOnAnotherProgram} {...isOnAnotherProgramField}>
                    Família registrada em outro programa
                  </Checkbox>
                </Form.Item>
              </Flex>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24} md={16}>
              <Form.Item label={'Endereço'} validateStatus={formValidation(addressMeta)} help={formHelper(addressMeta)}>
                <Input
                  id="address"
                  name="address"
                  onChange={handleChange}
                  value={values.address}
                  onPressEnter={submitForm}
                />
              </Form.Item>
            </Col>
            <Col span={24} md={8}>
              <Form.Item
                label={'Quantidade de quartos'}
                validateStatus={formValidation(numberOfRoomsMeta)}
                help={formHelper(numberOfRoomsMeta)}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  id="numberOfRooms"
                  name="numberOfRooms"
                  onChange={(value) => setFieldValue('numberOfRooms', value)}
                  value={values.numberOfRooms}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={24} md={8}>
              <Form.Item
                label={'Tipo de Casa'}
                validateStatus={formValidation(houseTypeMeta)}
                help={formHelper(houseTypeMeta)}
                extra="Prédio, casa de alvenaria, casa madeira, outros..."
              >
                <Input
                  id="houseType"
                  name="houseType"
                  onChange={handleChange}
                  value={values.houseType}
                  onPressEnter={submitForm}
                />
              </Form.Item>
            </Col>
            <Col span={24} md={8}>
              <Form.Item
                label={'Renda familiar total'}
                validateStatus={formValidation(totalSalaryMeta)}
                help={formHelper(totalSalaryMeta)}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  id="totalSalary"
                  name="totalSalary"
                  onChange={(value) => setFieldValue('totalSalary', value)}
                  value={Number(values.totalSalary)}
                  decimalSeparator=","
                  step={0.01}
                  precision={2}
                  min={0}
                  formatter={(value) => {
                    if (value === '') return `R$ `;
                    return value && Number(value) !== 0 && !Number.isNaN(Number(value)) ? `R$ ${value}` : '';
                  }}
                  parser={(value) => (value ? value.replace(/(R)|(\$)/g, '').trim() : '')}
                />
              </Form.Item>
            </Col>
            <Col span={24} md={8} style={ColCheckStyle}>
              <Flex alignItems="center" justifyContent="center" style={{ width: '100%', height: '100%' }}>
                <Form.Item validateStatus={formValidation(haveSewageMeta)} help={formHelper(haveSewageMeta)}>
                  <Checkbox checked={values.haveSewage} {...haveSewageField}>
                    Possui esgoto
                  </Checkbox>
                </Form.Item>
              </Flex>
            </Col>
            <Col span={24} md={24}>
              <Form.Item
                label={'Comentário sobre esgoto'}
                validateStatus={formValidation(sewageCommentMeta)}
                help={formHelper(sewageCommentMeta)}
              >
                <Input
                  id="sewageComment"
                  name="sewageComment"
                  onChange={handleChange}
                  value={values.sewageComment}
                  onPressEnter={submitForm}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} md={12}>
              <Form.Item
                label={'Entidade vinculada'}
                validateStatus={formValidation(placeStoreIdMeta)}
                help={formHelper(placeStoreIdMeta)}
              >
                <Select
                  defaultValue={values.placeStoreId?.toString()}
                  onSelect={(value) => setFieldValue('placeStoreId', value)}
                  value={values.placeStoreId?.toString() || undefined}
                  onChange={(value: string) => {
                    setFieldValue('placeStoreId', value);
                  }}
                  onBlur={() => {
                    setFieldTouched('placeStoreId', true);
                  }}
                >
                  {placeStore.map((placeStore) => (
                    <Select.Option key={placeStore.id} value={Number(placeStore.id).toString()}>
                      {placeStore.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} md={12} style={ColCheckStyle}>
              <Flex alignItems="flex-end" justifyContent="center" style={{ width: '100%', height: '100%' }}>
                <Form.Item
                  validateStatus={formValidation(isRegisteredInPersonMeta)}
                  help={formHelper(isRegisteredInPersonMeta)}
                >
                  <Checkbox checked={values.isRegisteredInPerson} {...isRegisteredInPersonField}>
                    Registrado pessoalmente
                  </Checkbox>
                </Form.Item>
              </Flex>
            </Col>
          </Row>
          <Divider />
          <PageHeader
            title={<Typography.Text>Membros</Typography.Text>}
            style={{ padding: 0, paddingBottom: 20 }}
            extra={[
              <Button key={'adult'} onClick={() => setModal({ open: true, type: 'adult' })}>
                Adicionar adulto
              </Button>,
              <Button key={'child'} onClick={() => setModal({ open: true, type: 'child' })}>
                Adicionar criança
              </Button>
            ]}
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
                        type: item.isHired === null || item.isHired === undefined ? 'child' : 'adult',
                        item
                      });
                    }}
                  >
                    Editar
                  </Button>,
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
                ]}
                style={{ paddingBottom: 0 }}
              >
                <List.Item.Meta
                  title={
                    <>
                      {item.isResponsible ? (
                        <strong>
                          {'Responsável familiar'} <br />
                        </strong>
                      ) : (
                        ''
                      )}
                      {`${item.name} - ${item.isHired === null || item.isHired === undefined ? 'Criança' : 'Adulto'}`}
                    </>
                  }
                  description={
                    <Row gutter={[16, 16]}>
                      <Col span={24} md={12}>
                        <Row>
                          {(item.email || item.phone) && `${item.email || ''} - ${formatPhone(item.phone) || ''}`}
                        </Row>
                        <Row>{(item.cpf || item.rg) && `CPF: ${item.cpf || ''} - RG: ${item.rg || ''}`}</Row>
                        <Row>{item.schoolName && `Escola: ${item.schoolName || ''}`}</Row>
                      </Col>
                      {item.profession && (
                        <Col span={24} md={12}>
                          <Row>{`Profissão: ${item.profession || ''}`}</Row>
                          <Row>{`Salário: ${item.salary ? 'R$ ' + formatMoney(item.salary) : 'Não informado'}`}</Row>
                        </Col>
                      )}
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
          type={modal.type}
          onClose={() => setModal({ open: false, type: '' })}
          onEdit={(value: Dependent) => {
            const list = responsibleDependent(value);
            setFieldValue('dependents', list);
            setModal({ open: false, type: '' });
          }}
          onCreate={(value: Dependent) => {
            value.nis = Math.random().toString(36).substr(0, 10);
            const list = responsibleDependent(value);
            setFieldValue('dependents', list);
            setModal({ open: false, type: '' });
          }}
        />
      )}
    </PageContainer>
  );
};

const schemaChild = yup.object().shape({
  name: yup.string().label('Nome').required(),
  birthday: yup.date().label('Nascimento').required()
});

const schemaAdult = yup.object().shape({
  name: yup.string().label('Nome').required(),
  birthday: yup.date().label('Nascimento').required(),
  rg: yup.string().label('RG').required(),
  cpf: yup.string().label('CPF').required()
});

const typeDependent = {
  name: '',
  schoolName: undefined,
  birthday: undefined,
  rg: undefined,
  cpf: undefined,
  phone: undefined,
  profession: undefined,
  isHired: undefined,
  isFormal: undefined,
  isResponsible: undefined,
  salary: undefined,
  email: undefined,
  type: ''
};

/**
 * Dependent form component
 * @param props component props
 */
export const DependentForm: React.FC<{
  type: string | 'adult' | 'child';
  item?: Dependent | null;
  onEdit: (item: Dependent) => void;
  onCreate: (item: Dependent) => void;
  onClose: () => void;
}> = ({ onClose, onEdit, onCreate, item, type }) => {
  const isCreating = !!!item;

  const { handleChange, values, errors, touched, getFieldMeta, submitForm, setFieldValue, getFieldProps } = useFormik({
    initialValues: item
      ? item
      : {
          ...typeDependent,
          isHired: type === 'adult' ? false : undefined
        },
    validationSchema: type === 'child' ? schemaChild : schemaAdult,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      values.type = type;
      if (item) onEdit(values as Dependent);
      else onCreate(values as Dependent);
    }
  });

  const nameMeta = getFieldMeta('name');
  const birthdayMeta = getFieldMeta('birthday');
  const rgMeta = getFieldMeta('rg');
  const cpfMeta = getFieldMeta('cpf');
  const phoneMeta = getFieldMeta('phone');
  const professionMeta = getFieldMeta('profession');
  const isHiredMeta = getFieldMeta('isHired');
  const isHiredField = getFieldProps('isHired');
  const isFormalMeta = getFieldMeta('isFormal');
  const isFormalField = getFieldProps('isFormal');
  const salaryMeta = getFieldMeta('salary');
  const emailMeta = getFieldMeta('email');
  const isResponsibleMeta = getFieldMeta('isResponsible');
  const isResponsibleField = getFieldProps('isResponsible');

  return (
    <Modal
      visible={true}
      title={isCreating ? 'Criar' : 'Editar'}
      onOk={submitForm}
      onCancel={onClose}
      okType={errors && Object.keys(errors).length > 0 && touched ? 'danger' : 'primary'}
    >
      <Form layout="vertical">
        {type === 'adult' && (
          <Form.Item
            style={{ marginBottom: 0 }}
            validateStatus={formValidation(isResponsibleMeta)}
            help={formHelper(isResponsibleMeta)}
          >
            <Checkbox checked={values.isResponsible} {...isResponsibleField}>
              É o responsável familiar
            </Checkbox>
          </Form.Item>
        )}
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
        <Form.Item
          label={
            <>
              {`RG`}
              {type === 'child' && <small>&nbsp; {`(opcional)`}</small>}
            </>
          }
          validateStatus={formValidation(rgMeta)}
          help={formHelper(rgMeta)}
        >
          <Input id="rg" name="rg" onChange={handleChange} value={formatRG(values.rg)} onPressEnter={submitForm} />
        </Form.Item>
        <Form.Item
          label={
            <>
              {`CPF`}
              {type === 'child' && <small>&nbsp; {`(opcional)`}</small>}
            </>
          }
          validateStatus={formValidation(cpfMeta)}
          help={formHelper(cpfMeta)}
        >
          <Input id="cpf" name="cpf" onChange={handleChange} value={formatCPF(values.cpf)} onPressEnter={submitForm} />
        </Form.Item>
        {type === 'adult' && (
          <>
            <Form.Item label={'Email'} validateStatus={formValidation(emailMeta)} help={formHelper(emailMeta)}>
              <Input id="email" name="email" onChange={handleChange} value={values.email} onPressEnter={submitForm} />
            </Form.Item>
            <Form.Item label={'Telefone'} validateStatus={formValidation(phoneMeta)} help={formHelper(phoneMeta)}>
              <Input
                id="phone"
                name="phone"
                onChange={handleChange}
                value={formatPhone(values.phone)}
                onPressEnter={submitForm}
              />
            </Form.Item>
            <Row gutter={[16, 16]}>
              <Col span={24} md={12} style={ColCheckStyle}>
                <Form.Item
                  style={{ marginBottom: 0 }}
                  validateStatus={formValidation(isHiredMeta)}
                  help={formHelper(isHiredMeta)}
                >
                  <Checkbox checked={values.isHired} {...isHiredField}>
                    Pessoa empregada
                  </Checkbox>
                </Form.Item>
              </Col>
              {values.isHired && (
                <Col span={24} md={12} style={ColCheckStyle}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    validateStatus={formValidation(isFormalMeta)}
                    help={formHelper(isFormalMeta)}
                  >
                    <Checkbox checked={values.isFormal} {...isFormalField}>
                      Emprego formal
                    </Checkbox>
                  </Form.Item>
                </Col>
              )}
            </Row>
            {values.isHired && (
              <Form.Item
                label={'Profissão'}
                validateStatus={formValidation(professionMeta)}
                help={formHelper(professionMeta)}
              >
                <Input
                  id="profession"
                  name="profession"
                  disabled={!values.isHired}
                  onChange={handleChange}
                  value={values.profession}
                  onPressEnter={submitForm}
                />
              </Form.Item>
            )}
            {values.isHired && (
              <Form.Item label={'Salário'} validateStatus={formValidation(salaryMeta)} help={formHelper(salaryMeta)}>
                <InputNumber
                  style={{ width: '100%' }}
                  disabled={!values.isHired}
                  id="salary"
                  name="salary"
                  onChange={(value) => setFieldValue('salary', value)}
                  value={Number(values.salary)}
                  decimalSeparator=","
                  step={0.01}
                  precision={2}
                  min={0}
                  formatter={(value) => {
                    if (value === '') return `R$ `;
                    return value && Number(value) !== 0 && !Number.isNaN(Number(value)) ? `R$ ${value}` : '';
                  }}
                  parser={(value) => (value ? value.replace(/(R)|(\$)/g, '').trim() : '')}
                />
              </Form.Item>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};
