import React, { useState, useMemo } from 'react';
import { Alert, Button, Descriptions, Form, Input, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Flex } from '../flex';
import { FamilyActions, FamilyWrapper } from './styles';
import { AppState } from '../../redux/rootReducer';
import { requestGetFamily } from '../../redux/family/actions';
import { Family } from '../../interfaces/family';
import moment from 'moment';
import { Dependent } from '../../interfaces/dependent';

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
  const [responsibleCPF, setResponsibleCPF] = useState<NonNullable<Dependent['cpf']>>('');

  // Redux state
  const familyLoading = useSelector<AppState, boolean>(({ familyReducer }) => familyReducer.loading);
  const family = useSelector<AppState, Family | null | undefined>(({ familyReducer }) => familyReducer.item);
  const error = useSelector<AppState, Error | undefined>(({ familyReducer }) => familyReducer.error);

  const familyDependent = React.useMemo(() => {
    if (family?.dependents && family?.dependents.length > 0) return family?.dependents[0];
    else return null;
  }, [family]);

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

  const sameCPF = useMemo(() => {
    const CPF = (family?.dependents || []).find((d) => d.isResponsible)?.cpf;
    return CPF && CPF.replace(/\D/g, '') === responsibleCPF.replace(/\D/g, '');
  }, [family, responsibleCPF]);

  return (
    <>
      {error && <Alert message="Ocorreu um erro" description={error.message} type="error" showIcon />}
      <Form layout="vertical">
        <Form.Item label="Código da família">
          <Input.Search
            loading={familyLoading}
            enterButton
            onChange={(event) => setNis(event.target.value.toUpperCase())}
            value={nis}
            maxLength={11}
            onPressEnter={() => {
              changeFamilyId(undefined);
              setResponsibleCPF('');
              dispatch(requestGetFamily(nis));
            }}
            onSearch={(value) => {
              changeFamilyId(undefined);
              setResponsibleCPF('');
              dispatch(requestGetFamily(value));
            }}
          />
        </Form.Item>
        {family && family.id && (
          <Form.Item
            label="CPF do responsável"
            validateStatus={responsibleCPF.length > 10 && !sameCPF ? 'error' : ''}
            help={responsibleCPF.length > 10 && !sameCPF ? 'CPF incorreto' : ''}
          >
            <Input
              style={{ width: '100%' }}
              id="responsibleCPF"
              name="responsibleCPF"
              onChange={(event) => setResponsibleCPF(event.target.value)}
            />
          </Form.Item>
        )}
      </Form>

      {!familyId && !familyLoading && family && familyDependent && sameCPF && (
        <FamilyWrapper>
          <Alert
            type="info"
            message={
              <div>
                <Descriptions layout="vertical" size="small" title="Família encontrada" colon={false} bordered>
                  <Descriptions.Item label="Nome do responsável">{familyDependent.name}</Descriptions.Item>
                  <Descriptions.Item label="Data de nascimento do responsável">
                    {moment(familyDependent.birthday).format('DD/MM/YYYY')}
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
      {familyId && !familyLoading && family && familyDependent && (
        <FamilyWrapper>
          <Descriptions bordered size="small" title="Família Selecionada" layout="vertical">
            <Descriptions.Item label="Nome do responsável">{familyDependent.name}</Descriptions.Item>
            <Descriptions.Item label="Data de nascimento">
              {moment(familyDependent?.birthday).format('DD/MM/YYYY')}
            </Descriptions.Item>
          </Descriptions>
        </FamilyWrapper>
      )}
    </>
  );
};
