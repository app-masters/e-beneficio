import React, { useState, useEffect } from 'react';
import { Form, Button, Input, Typography, Card } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { FamilyWrapper, InfoContainer, PriceStyle, PriceLabelStyle, HowToHeaderContainer, HowToLabel } from './styles';
import { AppState } from '../../redux/rootReducer';
import { requestGetFamily } from '../../redux/family/actions';
import { Family } from '../../interfaces/family';
import { Flex } from '../flex';

const { Text } = Typography;

type ComponentProps = {
  onFamilySelect?: (id: Family['id']) => void;
  askForBirthday?: boolean;
};

/**
 * Family search component
 * @param props component props
 */
export const FamilySearch: React.FC<ComponentProps> = (props) => {
  const dispatch = useDispatch();

  // Local state
  const [nis, setNis] = useState('');
  const [familyId, setFamilyId] = useState<Family['id']>();
  // Redux state
  const familyLoading = useSelector<AppState, boolean>((state) => state.familyReducer.loading);
  const familyError = useSelector<AppState, Error | undefined>((state) => state.familyReducer.error);
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familyReducer.item);

  // .env
  const cityId = process.env.REACT_APP_ENV_CITY_ID as string;

  /**
   * Use callback on the change of the familyId
   * @param id family unique ID
   */
  const changeFamilyId = (id: Family['id']) => {
    setFamilyId(id);
    if (props.onFamilySelect) {
      props.onFamilySelect(id);
    }
  };

  useEffect(() => {
    if (family) {
      const { id } = family;
      setFamilyId(id);
      if (props.onFamilySelect) {
        props.onFamilySelect(id);
      }
    }
  }, [props, family]);

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
              changeFamilyId(undefined);
              dispatch(requestGetFamily(nis, cityId));
            }}
            onSearch={(value) => {
              changeFamilyId(undefined);
              dispatch(requestGetFamily(value, cityId));
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

      {familyId && !familyLoading && family && (
        <FamilyWrapper>
          <Card>
            <Text style={PriceLabelStyle}>{'Saldo disponível: '}</Text>
            <Text style={PriceStyle}>{`R$${(family.balance || 0).toFixed(2).replace('.', ',')}`}</Text>

            <HowToHeaderContainer>
              <HowToLabel>
                Para utilizar os seus créditos, vá até um dos estabelecimentos parceiros e informe que faz parte do
                programa
              </HowToLabel>
            </HowToHeaderContainer>
            <Flex justifyContent="center">
              <Button href={'#establishment'}>Ver Estabelecimentos</Button>
            </Flex>
          </Card>
        </FamilyWrapper>
      )}
    </>
  );
};
