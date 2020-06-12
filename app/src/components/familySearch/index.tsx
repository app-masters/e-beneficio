import React, { useState } from 'react';
import { Alert, Button, Descriptions, Form, Input, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Flex } from '../flex';
import { FamilyActions, FamilyWrapper } from './styles';
import { AppState } from '../../redux/rootReducer';
import { requestGetFamily } from '../../redux/family/actions';
import { Family } from '../../interfaces/family';
import moment from 'moment';

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
  const [birthday, setBirthday] = useState('');
  // Redux state
  const familyLoading = useSelector<AppState, boolean>((state) => state.familyReducer.loading);
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familyReducer.item);

  const sameBirthday = moment(family?.responsibleBirthday).diff(moment(birthday, 'DD/MM/YYYY'), 'days') === 0;
  const isTicket = process.env.REACT_APP_CONSUMPTION_TYPE === 'ticket';

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
      <Form layout="vertical">
        <Form.Item label="Código NIS do responsável">
          <Input.Search
            loading={familyLoading}
            enterButton
            onChange={(event) => setNis(event.target.value)}
            value={nis}
            maxLength={11}
            onPressEnter={() => {
              changeFamilyId(undefined);
              setBirthday('');
              dispatch(requestGetFamily(nis));
            }}
            onSearch={(value) => {
              changeFamilyId(undefined);
              setBirthday('');
              dispatch(requestGetFamily(value));
            }}
          />
        </Form.Item>
      </Form>
      {!familyId && !familyLoading && family && (
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
                  <Descriptions.Item label="Nome da mãe do responsável">
                    {family.responsibleMotherName}
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
            <Descriptions.Item label="Nome da mãe">{family.responsibleMotherName}</Descriptions.Item>
            {isTicket && (
              <Descriptions.Item label="Saldo disponível">
                <Typography.Paragraph strong>{`R$${(family.balance as number)
                  .toFixed(2)
                  .replace('.', ',')}`}</Typography.Paragraph>
              </Descriptions.Item>
            )}
          </Descriptions>
        </FamilyWrapper>
      )}
    </>
  );
};
