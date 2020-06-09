import React, { useState } from 'react';
import { Form, Input, Typography, Descriptions, Row, Col, Alert } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { FamilyWrapper, InfoContainer } from './styles';
import { AppState } from '../../redux/rootReducer';
import { requestGetFamily } from '../../redux/families/actions';
import { Family } from '../../interfaces/family';
import moment from 'moment';
import { formatMoney } from '../../utils/string';

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
  const familyError = useSelector<AppState, (Error & { status?: number }) | undefined>(
    (state) => state.familiesReducer.familyError
  );
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
          <Alert
            type={familyError.status === 404 ? 'info' : 'error'}
            message={
              <InfoContainer>
                <Text>{familyError.message}</Text>
              </InfoContainer>
            }
          />
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
                <Descriptions.Item label="Saldo disponível">
                  <Typography.Paragraph strong>{`R$${formatMoney(family.balance || 0)}`}</Typography.Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Endereço">{family.address}</Descriptions.Item>
                <Descriptions.Item label="Telefone">{family.phone}</Descriptions.Item>
                <Descriptions.Item label="Telefone 2">{family.phone2}</Descriptions.Item>
                {family.dependents && (
                  <>
                    {family.dependents.map((dependent: NonNullable<Family['dependents'][number]>) => (
                      <Descriptions.Item key={dependent.id} label="Dependente">
                        {`${dependent.name} (${moment(dependent.birthday).format('DD/MM/YYYY')}) - ${
                          dependent.schoolName
                        }`}
                      </Descriptions.Item>
                    ))}
                  </>
                )}
              </Descriptions>
            </Col>
          </Row>
        </FamilyWrapper>
      )}
    </>
  );
};
