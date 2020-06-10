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
  notification,
  Divider,
  Alert
} from 'antd';
import { RouteComponentProps } from 'react-router-dom';
import yup from '../../utils/yup';
import { useFormik, FieldMetaProps } from 'formik';
import { familyGroupList } from '../../utils/constraints';
import { formatPhone, formatRG, formatCPF, formatMoney } from '../../utils/string';
import locale from 'antd/es/date-picker/locale/pt_BR';
import moment from 'moment';
import { PageContainer, ColCheckStyle, ActionWrapper } from './styles';
import { Dependent } from '../../interfaces/dependent';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { requestSaveFamily } from '../../redux/family/actions';
import { useDispatch, useSelector } from 'react-redux';
import { Family } from '../../interfaces/family';
import { AppState } from '../../redux/rootReducer';

const schema = yup.object().shape({
  code: yup.string().label('Código').required(),
  groupName: yup.string().label('Grupo familiar').required()
});

const typeFamily = {
  code: '',
  cityId: 0,
  groupName: '',
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
export const FamiliesForm: React.FC<RouteComponentProps<{ id: string }>> = () => {
  const [modal, setModal] = React.useState<{
    item?: Dependent | null;
    open: boolean;
    type: string | 'adult' | 'child';
  }>({
    open: false,
    type: ''
  });

  const dispatch = useDispatch();

  const loading = useSelector<AppState, boolean>(({ familyReducer }) => familyReducer.loading);
  const error = useSelector<AppState, Error | undefined>(({ familyReducer }) => familyReducer.error);
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
    initialValues: typeFamily,
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      const newFamily = { ...values, balance: 0 };
      dispatch(requestSaveFamily(newFamily as Family));
    }
  });

  const family = useSelector<AppState, Family | null | undefined>(({ familyReducer }) =>
    familyReducer.list?.find((f: Family) => f.code === values?.code)
  );

  /**
   * Remove dependent form component
   */
  const removeDependent = (nis: string) => {
    const list = values.dependents.filter((f: Dependent) => f.nis !== nis);
    setFieldValue('dependents', list);
  };

  /**
   * Verify NIS duplicated
   */
  const verifyDependentNIS = (value: Dependent) => {
    const verify = values.dependents.find((f: Dependent) => f.nis === value.nis);
    if (verify) {
      notification.warning({ message: 'NIS já cadastrado' });
      return false;
    }
    return true;
  };

  /**
   * Handle responsable
   */
  const responsibleDependent = (value: Dependent) => {
    let list: Dependent[] = [...values.dependents];
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

  /**
   * Helper function
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const helper = (type: FieldMetaProps<any>) => {
    return !!type.error && !!type.touched ? type.error : undefined;
  };
  /**
   * Validation function
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validation = (type: FieldMetaProps<any>) => {
    return !!type.error && !!type.touched ? 'error' : '';
  };

  const codeMeta = getFieldMeta('code');
  const groupNameMeta = getFieldMeta('groupName');

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
      <Card loading={loading} title={<Typography.Title>Nova Familia</Typography.Title>}>
        <Form layout="vertical">
          {error && <Alert message="Ocorreu um erro" description={error.message} type="error" showIcon />}
          {!error && family && family.id && (
            <Alert
              message="Familia salva"
              description={'Os dados de familia foram salvos com sucesso!'}
              type="success"
              showIcon
            />
          )}
          <Row gutter={[16, 16]}>
            <Col span={24} md={8}>
              <Form.Item label={'Código'} validateStatus={validation(codeMeta)} help={helper(codeMeta)}>
                <Input
                  id="code"
                  maxLength={11}
                  name="code"
                  onChange={handleChange}
                  value={values.code}
                  onPressEnter={submitForm}
                />
              </Form.Item>
            </Col>
            <Col span={24} md={8}>
              <Form.Item
                label={'Grupo familiar'}
                validateStatus={validation(groupNameMeta)}
                help={helper(groupNameMeta)}
              >
                <Select
                  defaultValue={values.groupName?.toString()}
                  onSelect={(value) => setFieldValue('groupName', value)}
                  value={values.groupName?.toString() || undefined}
                  onChange={(value: string) => {
                    setFieldValue('groupName', value);
                  }}
                  onBlur={() => {
                    setFieldTouched('groupName', true);
                  }}
                >
                  {Object.keys(familyGroupList).map((item) => (
                    <Select.Option key={item} value={item}>
                      {familyGroupList[item].title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} md={8}>
              <Form.Item
                label={'Salário total'}
                validateStatus={validation(totalSalaryMeta)}
                help={helper(totalSalaryMeta)}
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
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24} md={8} style={ColCheckStyle}>
              <Form.Item validateStatus={validation(isRegisteredInPersonMeta)} help={helper(isRegisteredInPersonMeta)}>
                <Checkbox checked={values.isRegisteredInPerson} {...isRegisteredInPersonField}>
                  Registrado pessoalmente
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={24} md={8} style={ColCheckStyle}>
              <Form.Item validateStatus={validation(isOnGovernProgramMeta)} help={helper(isOnGovernProgramMeta)}>
                <Checkbox checked={values.isOnGovernProgram} {...isOnGovernProgramField}>
                  Pessoa em programa do governo
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={24} md={8} style={ColCheckStyle}>
              <Form.Item validateStatus={validation(isOnAnotherProgramMeta)} help={helper(isOnAnotherProgramMeta)}>
                <Checkbox checked={values.isOnAnotherProgram} {...isOnAnotherProgramField}>
                  Pessoa em outro programa
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24} md={8}>
              <Form.Item label={'Endereço'} validateStatus={validation(addressMeta)} help={helper(addressMeta)}>
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
              <Form.Item label={'Tipo de Casa'} validateStatus={validation(houseTypeMeta)} help={helper(houseTypeMeta)}>
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
                label={'Quantidade de quartos'}
                validateStatus={validation(numberOfRoomsMeta)}
                help={helper(numberOfRoomsMeta)}
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
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={24} md={8} style={ColCheckStyle}>
              <Form.Item validateStatus={validation(haveSewageMeta)} help={helper(haveSewageMeta)}>
                <Checkbox checked={values.haveSewage} {...haveSewageField}>
                  Possui esgoto
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={24} md={16}>
              <Form.Item
                label={'Comentário sobre esgoto'}
                validateStatus={validation(sewageCommentMeta)}
                help={helper(sewageCommentMeta)}
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
          <Divider />
        </Form>
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
          renderItem={(item: Dependent) => (
            <List.Item
              actions={[
                <Button
                  key={'edit'}
                  onClick={() => {
                    if (item.type) setModal({ open: true, type: item.type, item });
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
                      onOk: () => removeDependent(item.nis)
                    })
                  }
                >
                  Remover
                </Button>
              ]}
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
                    {`${item.name} - ${item.type === 'child' ? 'Criança' : 'Adulto'}`}
                  </>
                }
                description={
                  <Row gutter={[16, 16]}>
                    <Col span={24} md={12}>
                      {`NIS: ${item.nis}`}
                      {(item.email || item.phone) && (
                        <>
                          <br />
                          {`${item.email || ''} - ${item.phone || ''}`}
                        </>
                      )}
                      {(item.cpf || item.rg) && (
                        <>
                          <br />
                          {`CPF: ${item.cpf || ''} - RG: ${item.rg || ''}`}
                        </>
                      )}
                      {item.schoolName && (
                        <>
                          <br />
                          {`Escola: ${item.schoolName || ''}`}
                        </>
                      )}
                    </Col>
                    {item.profession && (
                      <Col span={24} md={12}>
                        {`Profissão: ${item.profession || ''}`}
                        <br />
                        {`Salário: ${item.salary ? 'R$ ' + formatMoney(item.salary) : 'Não informado'}`}
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
          <Button loading={loading} onClick={() => handleSubmit()} type={'primary'}>
            Concluir
          </Button>
        </ActionWrapper>
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
            if (verifyDependentNIS(value)) {
              const list = responsibleDependent(value);
              setFieldValue('dependents', list);
              setModal({ open: false, type: '' });
            }
          }}
        />
      )}
    </PageContainer>
  );
};

const schemaChild = yup.object().shape({
  nis: yup.string().label('Código').required(),
  name: yup.string().label('Nome').required(),
  birthday: yup.date().label('Nascimento').required()
});

const schemaAdult = yup.object().shape({
  nis: yup.string().label('Código').required(),
  name: yup.string().label('Nome').required(),
  birthday: yup.date().label('Nascimento').required(),
  rg: yup.string().label('RG').required(),
  cpf: yup.string().label('CPF').required()
});

const typeDependent = {
  nis: '',
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
    initialValues: item ? item : typeDependent,
    validationSchema: type === 'child' ? schemaChild : schemaAdult,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      values.type = type;
      if (item) onEdit(values as Dependent);
      else onCreate(values as Dependent);
    }
  });

  /**
   * Helper function
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const helper = (type: FieldMetaProps<any>) => {
    return !!type.error && !!type.touched ? type.error : undefined;
  };
  /**
   * Validation function
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validation = (type: FieldMetaProps<any>) => {
    return !!type.error && !!type.touched ? 'error' : '';
  };

  const nameMeta = getFieldMeta('name');
  const nisMeta = getFieldMeta('nis');
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
            validateStatus={validation(isResponsibleMeta)}
            help={helper(isResponsibleMeta)}
          >
            <Checkbox checked={values.isResponsible} {...isResponsibleField}>
              É o responsável familiar
            </Checkbox>
          </Form.Item>
        )}
        <Form.Item label={'Código'} validateStatus={validation(nisMeta)} help={helper(nisMeta)}>
          <Input
            id="nis"
            disabled={!isCreating}
            maxLength={11}
            name="nis"
            onChange={handleChange}
            value={values.nis}
            onPressEnter={submitForm}
          />
        </Form.Item>
        <Form.Item label={'Nome'} validateStatus={validation(nameMeta)} help={helper(nameMeta)}>
          <Input id="name" name="name" onChange={handleChange} value={values.name} onPressEnter={submitForm} />
        </Form.Item>
        <Form.Item label={'Nascimento'} validateStatus={validation(birthdayMeta)} help={helper(birthdayMeta)}>
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
          validateStatus={validation(rgMeta)}
          help={helper(rgMeta)}
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
          validateStatus={validation(cpfMeta)}
          help={helper(cpfMeta)}
        >
          <Input id="cpf" name="cpf" onChange={handleChange} value={formatCPF(values.cpf)} onPressEnter={submitForm} />
        </Form.Item>
        {type === 'adult' && (
          <>
            <Form.Item label={'Email'} validateStatus={validation(emailMeta)} help={helper(emailMeta)}>
              <Input id="email" name="email" onChange={handleChange} value={values.email} onPressEnter={submitForm} />
            </Form.Item>
            <Form.Item label={'Telefone'} validateStatus={validation(phoneMeta)} help={helper(phoneMeta)}>
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
                  validateStatus={validation(isHiredMeta)}
                  help={helper(isHiredMeta)}
                >
                  <Checkbox checked={values.isHired} {...isHiredField}>
                    Pessoa empregada
                  </Checkbox>
                </Form.Item>
              </Col>
              <Col span={24} md={12} style={ColCheckStyle}>
                <Form.Item
                  style={{ marginBottom: 0 }}
                  validateStatus={validation(isFormalMeta)}
                  help={helper(isFormalMeta)}
                >
                  <Checkbox disabled={!values.isHired} checked={values.isFormal} {...isFormalField}>
                    Emprego formal
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={'Profissão'} validateStatus={validation(professionMeta)} help={helper(professionMeta)}>
              <Input
                id="profession"
                name="profession"
                disabled={!values.isHired}
                onChange={handleChange}
                value={values.profession}
                onPressEnter={submitForm}
              />
            </Form.Item>
            <Form.Item label={'Salário'} validateStatus={validation(salaryMeta)} help={helper(salaryMeta)}>
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
          </>
        )}
      </Form>
    </Modal>
  );
};
