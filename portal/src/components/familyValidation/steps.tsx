import React from 'react';
import { Form, Input, Button, Alert, Typography, Descriptions, Row, Col } from 'antd';
import { requestGetFamily } from '../../redux/family/actions';
import { env } from '../../env';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/rootReducer';
import moment from 'moment';
import { Family } from '../../interfaces/family';
import { FamilyWrapper, FamilyActions } from './styles';
import { Flex } from '../flex';
import yup from '../../utils/yup';
import { useFormik } from 'formik';
import { formatDate } from '../../utils/formatters';

const schemaNIS = yup.object().shape({
  nis: yup.number().label('NIS').required()
});

const schemaBirthday = yup.object().shape({
  birthday: yup.string().label('Data').required()
});

/**
 * StepNIS component
 * @param props component props
 */
export const StepNIS: React.FC<{}> = () => {
  const cityId = env.REACT_APP_ENV_CITY_ID as string;
  const dispatch = useDispatch();

  const familyLoading = useSelector<AppState, boolean>((state) => state.familyReducer.loading);
  const familyError = useSelector<AppState, Error | undefined>((state) => state.familyReducer.error);

  const { handleSubmit, values, getFieldMeta, setFieldValue } = useFormik({
    initialValues: {
      nis: ''
    },
    validationSchema: schemaNIS,
    enableReinitialize: true,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      dispatch(requestGetFamily(values.nis, cityId));
    }
  });

  const nisMeta = getFieldMeta('nis');

  return (
    <Form layout="vertical" onSubmitCapture={handleSubmit}>
      {familyError && <Alert message="" description={familyError.message} type="error" />}
      <Form.Item
        label="Código NIS do responsável"
        validateStatus={!!nisMeta.error && !!nisMeta.touched ? 'error' : ''}
        help={!!nisMeta.error && !!nisMeta.touched ? nisMeta.error : undefined}
      >
        <Input.Search
          name="nis"
          loading={familyLoading}
          type={'number'}
          onChange={(event) => setFieldValue('nis', event.target.value)}
          value={values.nis}
          maxLength={11}
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Row typeof="flex">
          <Col offset={12} span={12}>
            <Button block htmlType="submit" type={'primary'}>
              Buscar NIS
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

/**
 * StepBirthDay component
 * @param props component props
 */
export const StepBirthDay: React.FC<{ family?: Family | null; onValidBirthday?: () => void }> = ({
  family,
  onValidBirthday
}) => {
  const { handleSubmit, values, status, getFieldMeta, setFieldValue } = useFormik({
    initialValues: {
      birthday: ''
    },
    validationSchema: schemaBirthday,
    enableReinitialize: true,
    onSubmit: (values, { setStatus }) => {
      const sameBirthday =
        Math.abs(moment(family?.responsibleBirthday).diff(moment(values.birthday, 'DD/MM/YYYY'), 'days')) < 2;
      if (sameBirthday && onValidBirthday) onValidBirthday();
      else setStatus('Data de aniversário inválida.');
    }
  });

  const birthdayMeta = getFieldMeta('birthday');

  return (
    <Form layout="vertical" onSubmitCapture={handleSubmit}>
      {status && <Alert message="" description={status} type="error" />}
      <Form.Item
        label="Aniversário do responsável"
        validateStatus={!!birthdayMeta.error && !!birthdayMeta.touched ? 'error' : ''}
        help={!!birthdayMeta.error && !!birthdayMeta.touched ? birthdayMeta.error : undefined}
      >
        <Input
          style={{ width: '100%' }}
          id="birthday"
          name="birthday"
          onChange={(event) => {
            setFieldValue('birthday', formatDate(event.target.value));
          }}
          value={values.birthday}
          placeholder="DD/MM/YYYY"
        />
      </Form.Item>
      <Form.Item style={{ marginBottom: 0 }}>
        <Row typeof="flex">
          <Col offset={12} span={12}>
            <Button block htmlType="submit" type={'primary'}>
              Validar
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

/**
 * StepConfirmFamily component
 * @param props component props
 */
export const StepConfirmFamily: React.FC<{ family?: Family | null; onConfirm?: () => void; onCancel?: () => void }> = ({
  family,
  onConfirm,
  onCancel
}) => {
  return (
    <FamilyWrapper>
      <Alert
        type="info"
        message={
          <div>
            <Descriptions layout="vertical" size="small" title="Família encontrada" colon={false} bordered>
              <Descriptions.Item label="Nome do responsável">{family?.responsibleName}</Descriptions.Item>
            </Descriptions>
            <FamilyActions>
              <Typography.Paragraph strong>Os dados estão corretos?</Typography.Paragraph>
              <Flex alignItems="center" justifyContent="flex-end" gap>
                <Button htmlType="button" type="default" onClick={onCancel}>
                  Não
                </Button>
                <Button htmlType="button" type="primary" onClick={onConfirm}>
                  Sim, confirmar
                </Button>
              </Flex>
            </FamilyActions>
          </div>
        }
      />
    </FamilyWrapper>
  );
};

/**
 * StepSelectedFamily component
 * @param props component props
 */
export const StepSelectedFamily: React.FC<{ family?: Family | null }> = ({ family }) => {
  return (
    <FamilyWrapper>
      <Descriptions bordered size="small" title="Família Selecionada" layout="vertical">
        <Descriptions.Item label="Nome do responsável">{family?.responsibleName}</Descriptions.Item>
        <Descriptions.Item label="Data de nascimento">
          {family?.responsibleBirthday ? moment(family?.responsibleBirthday).format('DD/MM/YYYY') : ''}
        </Descriptions.Item>
      </Descriptions>
    </FamilyWrapper>
  );
};
