import React, { useState } from 'react';
import { Alert, Button, Card, Descriptions, Form, Input, Typography } from 'antd';
import { useFormik } from 'formik';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Flex } from '../../components/flex';
import yup from '../../utils/yup';
import { FamilyActions, PageContainer, FamilyWrapper } from './styles';
import { AppState } from '../../redux/rootReducer';
import { requestGetFamily } from '../../redux/family/actions';
import { Family } from '../../interfaces/family';
import moment from 'moment';
import { requestSaveConsumption } from '../../redux/consumption/actions';

const schema = yup.object().shape({
  nfce: yup.string().label('Nota fiscal eletrônica').required(),
  value: yup.string().label('Valor em reais').required(),
  proofImageUrl: yup.string().label('Link da imagem').required(),
  familyId: yup.string().label('Família').required('É preciso selecionar uma família ao digitar um NIS')
});

/**
 * Dashboard page component
 * @param props component props
 */
export const ConsumptionForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [nis, setNis] = useState('');
  // Redux state
  const familyLoading = useSelector<AppState, boolean>((state) => state.familyReducer.loading);
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familyReducer.item);

  const {
    handleSubmit,
    handleChange,
    values,
    getFieldMeta,
    submitForm,
    status,
    errors,
    touched,
    setFieldValue
  } = useFormik({
    initialValues: {
      nfce: '',
      value: '',
      proofImageUrl: '',
      nisCode: '',
      familyId: ''
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      dispatch(
        requestSaveConsumption(
          {
            nfce: values.nfce,
            value: Number(values.value),
            proofImageUrl: values.proofImageUrl,
            familyId: values.familyId
          },
          () => {
            window.alert('Consumo salvo com sucesso');
            history.push('/');
          }
        )
      );
    }
  });

  const valueMeta = getFieldMeta('value');
  const imageMeta = getFieldMeta('proofImageUrl');
  const nfceMeta = getFieldMeta('nfce');

  return (
    <PageContainer>
      <Card title={<Typography.Title>Informar consumo</Typography.Title>}>
        {status && <Alert message="Erro no formulário" description={status} type="error" />}
        <Form layout="vertical">
          <Form.Item label="Código NIS do responsável">
            <Input.Search
              loading={familyLoading}
              enterButton
              onChange={(event) => setNis(event.target.value)}
              value={nis}
              maxLength={11}
              onPressEnter={() => {
                setFieldValue('familyId', '');
                dispatch(requestGetFamily(nis));
              }}
              onSearch={(value) => {
                setFieldValue('familyId', '');
                dispatch(requestGetFamily(value));
              }}
            />
          </Form.Item>
        </Form>
        <form onSubmit={handleSubmit}>
          <Form layout="vertical">
            {!values.familyId && !familyLoading && family && (
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
                          <Typography.Paragraph strong>
                            Os dados foram validados com o responsável?
                          </Typography.Paragraph>
                          <Button htmlType="button" type="primary" onClick={() => setFieldValue('familyId', family.id)}>
                            Sim, confirmar
                          </Button>
                        </Flex>
                      </FamilyActions>
                    </div>
                  }
                />
              </FamilyWrapper>
            )}

            {values.familyId && !familyLoading && family && (
              <FamilyWrapper>
                <Descriptions bordered size="small" title="Família Selecionada" layout="vertical">
                  <Descriptions.Item label="Nome do responsável">{family.responsibleName}</Descriptions.Item>
                  <Descriptions.Item label="Data de nascimento">
                    {moment(family.responsibleBirthday).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nome da mãe">{family.responsibleMotherName}</Descriptions.Item>
                </Descriptions>
              </FamilyWrapper>
            )}
            {values.familyId && (
              <>
                <Form.Item
                  label="Valor da compra"
                  validateStatus={!!valueMeta.error && !!valueMeta.touched ? 'error' : ''}
                  help={!!valueMeta.error && !!valueMeta.touched ? valueMeta.error : undefined}
                >
                  <Input id="value" name="value" prefix="R$" onChange={handleChange} value={values.value} />
                </Form.Item>

                <Form.Item
                  label="Link da imagem"
                  validateStatus={!!imageMeta.error && !!imageMeta.touched ? 'error' : ''}
                  help={!!imageMeta.error && !!imageMeta.touched ? imageMeta.error : undefined}
                >
                  <Input id="proofImageUrl" name="proofImageUrl" onChange={handleChange} value={values.proofImageUrl} />
                </Form.Item>

                <Form.Item
                  label="Nota fiscal eletrônica"
                  validateStatus={!!nfceMeta.error && !!nfceMeta.touched ? 'error' : ''}
                  help={!!nfceMeta.error && !!nfceMeta.touched ? nfceMeta.error : undefined}
                >
                  <Input id="nfce" name="nfce" onChange={handleChange} value={values.nfce} onPressEnter={submitForm} />
                </Form.Item>
              </>
            )}
          </Form>
          <Flex alignItems="center" justifyContent="flex-end">
            <Button
              htmlType="submit"
              disabled={!!(errors && Object.keys(errors).length > 0 && touched) || !family}
              type="primary"
            >
              Confirmar consumo
            </Button>
          </Flex>
        </form>
      </Card>
    </PageContainer>
  );
};
