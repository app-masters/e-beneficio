import React, { useState } from 'react';
import { Form, Button, Input, Typography, Card, Alert, Descriptions, Row, Col } from 'antd';
import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import {
  FamilyWrapper,
  InfoContainer,
  PriceStyle,
  PriceLabelStyle,
  HowToHeaderContainer,
  HowToLabel,
  FamilyActions
} from './styles';
import { Flex } from '../flex';
import { AppState } from '../../redux/rootReducer';
import { requestGetFamily, requestResetFamily } from '../../redux/family/actions';
import { Family } from '../../interfaces/family';
import moment from 'moment';
import { env } from '../../env';
import yup from '../../utils/yup';
import { formatDate } from '../../utils/formatters';

const { Text } = Typography;

type ComponentProps = {
  onFamilySelect?: (id: Family['id']) => void;
  askForBirthday?: boolean;
  askForConfirmation?: boolean;
};

// Birthday validation schema
const schemaBirthday = yup.object().shape({
  birthday: yup.string().label('Data').required()
});

/**
 * Family search component
 * @param ComponentProps component props
 */
export const FamilySearch: React.FC<ComponentProps> = (props) => {
  const dispatch = useDispatch();

  // Local state
  const [nis, setNis] = useState('');
  const [invalidNIS, setInvalidNIS] = useState(false);
  const [validBirthday, setValidBirthday] = useState(false);
  const [familyConfirmed, setFamilyConfirmed] = useState(false);
  // Redux state
  const familyLoading = useSelector<AppState, boolean>((state) => state.familyReducer.loading);
  const familyError = useSelector<AppState, Error | undefined>((state) => state.familyReducer.error);
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familyReducer.item);

  // .env
  const cityId = env.REACT_APP_ENV_CITY_ID as string;

  /**
   * Callback used when the user confirm the selected family
   */
  const onConfirm = () => {
    setFamilyConfirmed(true);
  };

  /**
   * Callback used when the user cancels the selected family
   */
  const onCancel = () => {
    dispatch(requestResetFamily());
    setNis('');
    setValidBirthday(false);
  };

  return (
    <>
      <Form layout="vertical">
        <Form.Item
          validateStatus={invalidNIS ? 'error' : ''}
          help={invalidNIS ? 'NIS é um campo obrigatório' : undefined}
        >
          <Input.Search
            loading={familyLoading}
            enterButton
            type={'number'}
            onChange={(event) => setNis(event.target.value)}
            value={nis}
            maxLength={11}
            placeholder="Código NIS do responsável"
            onPressEnter={() => {
              if (!nis) {
                setInvalidNIS(true);
              } else {
                dispatch(requestGetFamily(nis, cityId));
                setValidBirthday(false);
                setFamilyConfirmed(false);
                setInvalidNIS(false);
              }
            }}
            onSearch={(value) => {
              if (!value) {
                setInvalidNIS(true);
              } else {
                dispatch(requestGetFamily(value, cityId));
                setValidBirthday(false);
                setFamilyConfirmed(false);
                setInvalidNIS(false);
              }
            }}
          />
        </Form.Item>
      </Form>

      {familyError && !familyLoading && (
        <FamilyWrapper>
          <Card>
            <Text>
              Não encontramos nenhuma família utilizando esse NIS. Tenha certeza que é o NIS do responsável familiar
              para conseguir consultar o saldo
            </Text>
            <InfoContainer>
              <Button href={'#info'}>Mais informações</Button>
            </InfoContainer>
          </Card>
        </FamilyWrapper>
      )}

      {!familyLoading && family && (
        <FamilyWrapper>
          <Card>
            {!validBirthday ? (
              <ConfirmBirthday family={family} onValidBirthday={() => setValidBirthday(true)} />
            ) : (
              <>
                {props.askForConfirmation && !familyConfirmed ? (
                  <ConfirmFamily family={family} onConfirm={onConfirm} onCancel={onCancel} />
                ) : (
                  <FamilyBalance family={family} />
                )}
              </>
            )}
          </Card>
        </FamilyWrapper>
      )}
    </>
  );
};

/**
 * Form for birthday confirmation
 */
const ConfirmBirthday: React.FC<{ family: Family; onValidBirthday: () => void }> = ({ family, onValidBirthday }) => {
  const { handleSubmit, values, status, getFieldMeta, setFieldValue } = useFormik({
    initialValues: {
      birthday: ''
    },
    validationSchema: schemaBirthday,
    enableReinitialize: true,
    onSubmit: (values, { setStatus }) => {
      const sameBirthday =
        moment(family?.responsibleBirthday).diff(moment(values.birthday, 'DD/MM/YYYY'), 'days') === 0;
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
 * Family cofirmation alert message
 */
const ConfirmFamily: React.FC<{ family: Family | null | undefined; onConfirm: () => void; onCancel: () => void }> = ({
  family,
  onCancel,
  onConfirm
}) => (
  <Alert
    type="info"
    message={
      <div>
        <Descriptions layout="vertical" size="small" title="Família encontrada" colon={false} bordered>
          <Descriptions.Item label="Nome do responsável">{family?.responsibleName}</Descriptions.Item>
          <Descriptions.Item label="Data de nascimento do responsável">
            {family?.responsibleBirthday ? moment(family?.responsibleBirthday).format('DD/MM/YYYY') : ''}
          </Descriptions.Item>
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
);

/**
 * Component for displaying the family balance
 */
const FamilyBalance: React.FC<{ family: Family }> = ({ family }) => (
  <>
    <Text style={PriceLabelStyle}>{'Saldo disponível: '}</Text>
    <Text style={PriceStyle}>{`R$${(family.balance || 0).toFixed(2).replace('.', ',')}`}</Text>

    <HowToHeaderContainer>
      <HowToLabel>Você pode utilizar seus créditos utilizando o cartão recebido.</HowToLabel>
      {family.school && (
        <HowToLabel>
          {`Caso não tenha pego seu cartão, entre em contato com a escola `}
          <b>{`${family.school}`}</b>
        </HowToLabel>
      )}
      <HowToLabel>
        Se o saldo for superior ao disponível, possivelmente você precisa informar suas últimas compras para receber o
        reembolso.
      </HowToLabel>
      <Flex justifyContent="center">
        <Button href={'#compra'}>Informar compra</Button>
      </Flex>
    </HowToHeaderContainer>
  </>
);
