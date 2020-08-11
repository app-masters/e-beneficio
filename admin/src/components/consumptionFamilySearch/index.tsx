import React, { useState } from 'react';
import { Alert, Button, Descriptions, Form, Input, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Flex } from '../flex';
import { FamilyActions, FamilyWrapper, InfoContainer } from './styles';
import { AppState } from '../../redux/rootReducer';
import { requestGetFamily } from '../../redux/families/actions';
import { Family } from '../../interfaces/family';
import moment from 'moment';
import { env } from '../../env';

type ComponentProps = {
  onFamilySelect?: (id: Family['id']) => void;
  askForBirthday?: boolean;
};

/**
 * Family search component
 * @param props component props
 */
export const ConsumptionFamilySearch: React.FC<ComponentProps> = (props) => {
  const dispatch = useDispatch();

  // Local state
  const [nis, setNis] = useState('');
  const [familyId, setFamilyId] = useState<Family['id']>();
  const [birthday, setBirthday] = useState('');
  // Redux state
  const familyLoading = useSelector<AppState, boolean>((state) => state.familiesReducer.familyLoading);
  const familyError = useSelector<AppState, (Error & { status?: number }) | undefined>(
    (state) => state.familiesReducer.familyError
  );
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familiesReducer.familyItem);

  // .env
  const cityId = env.REACT_APP_ENV_CITY_ID as string;

  const sameBirthday = moment(family?.responsibleBirthday).diff(moment(birthday, 'DD/MM/YYYY'), 'days') === 0;

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

  return (
    <>
      <Form.Item label="Código NIS do responsável">
        <Input.Search
          loading={familyLoading}
          enterButton
          type={'number'}
          onChange={(event) => setNis(event.target.value)}
          value={nis}
          maxLength={11}
          onPressEnter={() => {
            changeFamilyId(undefined);
            setBirthday('');
            dispatch(requestGetFamily(nis, cityId));
          }}
          onSearch={(value) => {
            changeFamilyId(undefined);
            setBirthday('');
            dispatch(requestGetFamily(value, cityId));
          }}
        />
      </Form.Item>

      {familyError && !familyLoading && (
        <FamilyWrapper>
          <Alert
            type={familyError.status === 404 ? 'info' : 'error'}
            message={
              <InfoContainer>
                <Typography.Text>{familyError.message}</Typography.Text>
              </InfoContainer>
            }
          />
        </FamilyWrapper>
      )}

      {family && props.askForBirthday && (
        <Form.Item
          label="Aniversário do responsável"
          validateStatus={birthday.length > 9 && !sameBirthday ? 'error' : ''}
          help={birthday.length > 9 && !sameBirthday ? 'Aniversário incorreto' : ''}
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
      {!familyId && !familyLoading && family && (!props.askForBirthday || sameBirthday) && (
        <FamilyWrapper>
          <Alert
            type="info"
            message={
              <div>
                <Descriptions layout="vertical" size="small" title="Família encontrada" colon={false} bordered>
                  <Descriptions.Item label="Nome do responsável">{family.responsibleName}</Descriptions.Item>
                  <Descriptions.Item label="Data de nascimento do responsável">
                    {moment(family.responsibleBirthday).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                </Descriptions>
                <FamilyActions>
                  <Flex alignItems="center" justifyContent="flex-end" gap>
                    <Typography.Paragraph strong>Os dados foram validados com o responsável?</Typography.Paragraph>
                    <Button htmlType="button" type="primary" onClick={() => changeFamilyId(family.id)}>
                      Sim, confirmar
                    </Button>
                  </Flex>
                </FamilyActions>
              </div>
            }
          />
        </FamilyWrapper>
      )}
      {familyId && !familyLoading && family && (
        <FamilyWrapper>
          <Descriptions bordered size="small" title="Família Selecionada" layout="vertical">
            <Descriptions.Item label="Nome do responsável">{family.responsibleName}</Descriptions.Item>
            <Descriptions.Item label="Data de nascimento">
              {moment(family.responsibleBirthday).format('DD/MM/YYYY')}
            </Descriptions.Item>
          </Descriptions>
        </FamilyWrapper>
      )}
    </>
  );
};
