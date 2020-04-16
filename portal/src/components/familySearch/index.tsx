import React, { useState } from 'react';
import { Form, Button, Input, Typography, Card } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { FamilyWrapper, InfoContainer, PriceStyle, PriceLabelStyle, HowToHeaderContainer, HowToLabel } from './styles';
import { AppState } from '../../redux/rootReducer';
import { requestGetFamily } from '../../redux/family/actions';
import { Family } from '../../interfaces/family';
import { Flex } from '../flex';
import moment from 'moment';

const { Text } = Typography;

type ComponentProps = {
  onFamilySelect?: (id: Family['id']) => void;
  askForBirthday?: boolean;
};

/**
 * Family search component
 * @param props component props
 */
export const FamilySearch: React.FC<ComponentProps> = () => {
  const dispatch = useDispatch();

  // Local state
  const [nis, setNis] = useState('');
  const [birthday, setBirthday] = useState('');
  // Redux state
  const familyLoading = useSelector<AppState, boolean>((state) => state.familyReducer.loading);
  const familyError = useSelector<AppState, Error | undefined>((state) => state.familyReducer.error);
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familyReducer.item);

  // .env
  const cityId = process.env.REACT_APP_ENV_CITY_ID as string;

  const sameBirthday = moment(family?.responsibleBirthday).diff(moment(birthday, 'DD/MM/YYYY'), 'days') === 0;

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
              setBirthday('');
            }}
            onSearch={(value) => {
              dispatch(requestGetFamily(value, cityId));
              setBirthday('');
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
                <Text style={PriceLabelStyle}>{'Saldo disponível: '}</Text>
                <Text style={PriceStyle}>{`R$${(family.balance || 0).toFixed(2).replace('.', ',')}`}</Text>

                <HowToHeaderContainer>
                  <HowToLabel>
                    Para utilizar os seus créditos, vá até um dos estabelecimentos parceiros e informe que faz parte do
                    programa
                  </HowToLabel>
                </HowToHeaderContainer>
                <Flex justifyContent="center">
                  <Button href={'#estabelecimentos'}>Ver Estabelecimentos</Button>
                </Flex>
              </>
            ) : (
              <Form.Item
                label="Aniversário do responsável"
                validateStatus={birthday.length > 9 && !sameBirthday ? 'error' : ''}
                help={birthday.length > 9 && !sameBirthday ? 'Aniversário incorreto' : ''}
                style={{ marginBottom: 0, paddingBottom: 0 }}
              >
                <Input
                  style={{ width: '100%' }}
                  id="birthday"
                  name="birthday"
                  onChange={(event) => setBirthday(event.target.value)}
                  placeholder="DD/MM/YYYY"
                />
              </Form.Item>
            )}
          </Card>
        </FamilyWrapper>
      )}
    </>
  );
};
