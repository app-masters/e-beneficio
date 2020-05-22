import React, { useState } from 'react';
import { Form, Button, Input, Typography, Card, Alert, Descriptions } from 'antd';
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
import { StepBirthDay } from '../familyValidation/steps';

const { Text } = Typography;

type ComponentProps = {
  onFamilySelect?: (id: Family['id']) => void;
  askForBirthday?: boolean;
  askForConfirmation?: boolean;
};

/**
 * Family search component
 * @param ComponentProps component props
 */
export const FamilySearch: React.FC<ComponentProps> = (props) => {
  const dispatch = useDispatch();

  // Local state
  const [nis, setNis] = useState('');
  const [sameBirthday, setSameBirthday] = useState(false);
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
    setSameBirthday(false);
  };

  return (
    <>
      <Form layout="vertical">
        <Form.Item>
          <Input.Search
            loading={familyLoading}
            enterButton
            onChange={(event) => setNis(event.target.value)}
            value={nis}
            maxLength={11}
            placeholder="Código NIS do responsável"
            onPressEnter={() => {
              dispatch(requestGetFamily(nis, cityId));
              setSameBirthday(false);
              setFamilyConfirmed(false);
            }}
            onSearch={(value) => {
              dispatch(requestGetFamily(value, cityId));
              setSameBirthday(false);
              setFamilyConfirmed(false);
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
            {sameBirthday ? (
              <>
                {props.askForConfirmation && !familyConfirmed ? (
                  <Alert
                    type="info"
                    message={
                      <div>
                        <Descriptions layout="vertical" size="small" title="Família encontrada" colon={false} bordered>
                          <Descriptions.Item label="Nome do responsável">{family?.responsibleName}</Descriptions.Item>
                          <Descriptions.Item label="Data de nascimento do responsável">
                            {family?.responsibleBirthday
                              ? moment(family?.responsibleBirthday).format('DD/MM/YYYY')
                              : ''}
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
                ) : (
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
                        Se o saldo for superior ao disponível, possivelmente você precisa informar suas últimas compras
                        para receber o reembolso.
                      </HowToLabel>
                      <Flex justifyContent="center">
                        <Button href={'#compra'}>Informar compra</Button>
                      </Flex>
                    </HowToHeaderContainer>
                  </>
                )}
              </>
            ) : (
              <StepBirthDay family={family} onValidBirthday={() => setSameBirthday(true)} />
            )}
          </Card>
        </FamilyWrapper>
      )}
    </>
  );
};
