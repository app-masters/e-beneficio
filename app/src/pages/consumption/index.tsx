import { Alert, Button, Card, Descriptions, Form, Input, Typography } from 'antd';
import { useFormik } from 'formik';
import React, { useCallback, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Flex } from '../../components/Flex';
import yup from '../../utils/yup';
import { FamilyActions, PageContainer, FamilyWrapper } from './styles';

const schema = yup.object().shape({
  nfce: yup.string().label('Nota fiscal eletrônica').required(),
  value: yup.string().label('Valor em reais').required(),
  nisCode: yup.string().label('Código NIS').required(),
  proofImageUrl: yup.string().label('Link da imagem').required(),
  familyId: yup.string().label('Família').required('É preciso selecionar uma família ao digitar um NIS')
});

/**
 * Creates a fake wrapper for the family search while we don't have redux
 */
const useFakeNisSearch = (): any => {
  const [loading, setLoading] = useState(false);
  const [family, setFamily] = useState<
    | {
        id: number | string;
        responsibleName: string;
        responsibleBirthday: string;
        responsibleMotherName: string;
      }
    | undefined
  >(undefined);

  const doSearchNis = useCallback(
    async (value: string) => {
      console.log(value);
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setFamily({
        id: 1,
        responsibleName: 'Baraky corp',
        responsibleBirthday: '12/44/2020',
        responsibleMotherName: 'Tortilla mãe'
      });
    },
    [setLoading, setFamily]
  );

  return [loading, doSearchNis, family];
};

/**
 * Dashboard page component
 * @param props component props
 */
export const ConsumptionForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const [nisLoading, doSearchNis, family] = useFakeNisSearch();

  // const history = useHistory();
  // const isCreating = props.match.params.id === 'criar';
  // const dispatch = useDispatch();

  // // Redux state
  // const Consumption = useSelector<AppState, Consumption | undefined>(({ ConsumptionReducer }) =>
  //   ConsumptionReducer.list.find((item) => item.id === Number(props.match.params.id))
  // );

  // const loading = useSelector<AppState, boolean>(({ ConsumptionReducer }) => ConsumptionReducer.loading);

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
      alert(JSON.stringify(values));
    }
  });

  const valueMeta = getFieldMeta('value');
  const imageMeta = getFieldMeta('proofImageUrl');
  const nisMeta = getFieldMeta('nisCode');
  const nfceMeta = getFieldMeta('nfce');

  return (
    <PageContainer>
      <Card title={<Typography.Title>Consumo</Typography.Title>}>
        {status && <Alert message="Erro no formulário" description={status} type="error" />}
        <form onSubmit={handleSubmit}>
          <Form layout="vertical">
            {errors.familyId && touched && (
              <FamilyWrapper>
                <Alert type="error" message="Ocorreu um erro" description={errors.familyId} />
              </FamilyWrapper>
            )}

            <Form.Item
              label="Código NIS"
              validateStatus={!!nisMeta.error && !!nisMeta.touched ? 'error' : ''}
              help={!!nisMeta.error && !!nisMeta.touched ? nisMeta.error : undefined}
            >
              <Input.Search
                loading={nisLoading}
                enterButton
                id="nisCode"
                name="nisCode"
                onChange={handleChange}
                value={values.nisCode}
                maxLength={11}
                onPressEnter={() => {
                  setFieldValue('familyId', '');
                  doSearchNis(values.nisCode);
                }}
                onSearch={(value) => {
                  setFieldValue('familyId', '');
                  doSearchNis(value);
                }}
              />
            </Form.Item>

            {!values.familyId && !nisLoading && family && (
              <FamilyWrapper>
                <Alert
                  type="info"
                  message={
                    <div>
                      <Descriptions size="small" title="Família encontrada:">
                        <Descriptions.Item label="Nome do responsável">{family.responsibleName}</Descriptions.Item>
                        <Descriptions.Item label="Data de nascimento">{family.responsibleBirthday}</Descriptions.Item>
                        <Descriptions.Item label="Nome da mãe">{family.responsibleMotherName}</Descriptions.Item>
                      </Descriptions>
                      <FamilyActions>
                        <Flex alignItems="center" justifyContent="flex-end" gap>
                          <Typography.Paragraph type="danger">Esta família está correta?</Typography.Paragraph>
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

            {values.familyId && !nisLoading && family && (
              <FamilyWrapper>
                <Descriptions bordered size="small" title="Família Selecionada:">
                  <Descriptions.Item label="Nome do responsável">{family.responsibleName}</Descriptions.Item>
                  <Descriptions.Item label="Data de nascimento">{family.responsibleBirthday}</Descriptions.Item>
                  <Descriptions.Item label="Nome da mãe">{family.responsibleMotherName}</Descriptions.Item>
                </Descriptions>
              </FamilyWrapper>
            )}

            <Form.Item
              label="Valor em reais"
              validateStatus={!!valueMeta.error && !!valueMeta.touched ? 'error' : ''}
              help={!!valueMeta.error && !!valueMeta.touched ? valueMeta.error : undefined}
            >
              <Input
                id="value"
                name="value"
                prefix="R$"
                onChange={handleChange}
                value={values.value}
                onPressEnter={submitForm}
              />
            </Form.Item>

            <Form.Item
              label="Link da imagem"
              validateStatus={!!imageMeta.error && !!imageMeta.touched ? 'error' : ''}
              help={!!imageMeta.error && !!imageMeta.touched ? imageMeta.error : undefined}
            >
              <Input
                id="proofImageUrl"
                name="proofImageUrl"
                onChange={handleChange}
                value={values.proofImageUrl}
                onPressEnter={submitForm}
              />
            </Form.Item>

            <Form.Item
              label="Nota fiscal eletrônica"
              validateStatus={!!nfceMeta.error && !!nfceMeta.touched ? 'error' : ''}
              help={!!nfceMeta.error && !!nfceMeta.touched ? nfceMeta.error : undefined}
            >
              <Input id="nfce" name="nfce" onChange={handleChange} value={values.nfce} onPressEnter={submitForm} />
            </Form.Item>
          </Form>
          <Flex alignItems="center" justifyContent="flex-end">
            <Button htmlType="submit" type={errors && Object.keys(errors).length > 0 && touched ? 'danger' : 'primary'}>
              Enviar
            </Button>
          </Flex>
        </form>
      </Card>
    </PageContainer>
  );
};
