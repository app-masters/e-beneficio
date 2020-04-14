import React, { useState, useEffect } from 'react';
import { Descriptions, Form, Input, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { FamilyWrapper, InputStyle, ErrorMessageStyle } from './styles';
import { AppState } from '../../redux/rootReducer';
import { requestGetFamily } from '../../redux/family/actions';
import { Family } from '../../interfaces/family';

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
        <Form.Item style={InputStyle} label="Código NIS do responsável">
          <Input.Search
            loading={familyLoading}
            enterButton
            onChange={(event) => setNis(event.target.value)}
            value={nis}
            maxLength={11}
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
          <Descriptions size="small" layout="vertical">
            <Descriptions.Item style={ErrorMessageStyle}>
              Não encontramos nenhuma família utilizando esse NIS. Tenha certeza que é o NIS do responsável familiar
              para conseguir consultar o saldo.
            </Descriptions.Item>
          </Descriptions>
        </FamilyWrapper>
      )}

      {familyId && !familyLoading && family && (
        <FamilyWrapper>
          <Descriptions bordered size="small" title="Família Selecionada" layout="vertical">
            <Descriptions.Item label="Saldo disponível">
              <Typography.Paragraph strong>{`R$${(family.balance || 0)
                .toFixed(2)
                .replace('.', ',')}`}</Typography.Paragraph>
            </Descriptions.Item>
          </Descriptions>
        </FamilyWrapper>
      )}
    </>
  );
};
