import React, { useState } from 'react';
import { Form, Input, Button, Typography, Card, Descriptions, Row, Col } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { FamilyWrapper, InfoContainer } from './styles';
import { AppState } from '../../redux/rootReducer';
import { requestGetFamily } from '../../redux/families/actions';
import { Family } from '../../interfaces/family';
import moment from 'moment';
import { Link } from 'react-router-dom';

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
  // Redux state
  const familyLoading = useSelector<AppState, boolean>((state) => state.familiesReducer.familyLoading);
  const familyError = useSelector<AppState, Error | undefined>((state) => state.familiesReducer.familyError);
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familiesReducer.familyItem);

  // .env
  const cityId = process.env.REACT_APP_ENV_CITY_ID as string;

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
            }}
            onSearch={(value) => {
              dispatch(requestGetFamily(value, cityId));
            }}
          />
        </Form.Item>
      </Form>

      {familyError && !familyLoading && (
        <FamilyWrapper>
          <Card>
            <InfoContainer>
              <Text>Não encontramos nenhuma família utilizando esse NIS.</Text>
            </InfoContainer>
          </Card>
        </FamilyWrapper>
      )}

      {!familyLoading && family && (
        <FamilyWrapper>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Descriptions bordered size="small" layout="vertical">
                <Descriptions.Item label="Nome do responsável">{family.responsibleName}</Descriptions.Item>
                <Descriptions.Item label="Data de nascimento">
                  {moment(family.responsibleBirthday).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Nome da mãe">{family.responsibleMotherName}</Descriptions.Item>
                <Descriptions.Item label="Saldo disponível">
                  <Typography.Paragraph strong>{`R$${(family.balance || 0)
                    .toFixed(2)
                    .replace('.', ',')}`}</Typography.Paragraph>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col flex={1} />
            <Col>
              <Link to={`/familias/${family.id}/editar`}>
                <Button>Editar</Button>
              </Link>
            </Col>
          </Row>
        </FamilyWrapper>
      )}
    </>
  );
};
