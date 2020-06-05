import { CameraOutlined, QrcodeOutlined, WarningFilled, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Checkbox, Form, Input, InputNumber, Modal, Typography, Divider } from 'antd';
import { useFormik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import QrReader from 'react-qr-reader';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Flex } from '../../components/flex';
import { Family } from '../../interfaces/family';
import { requestSaveConsumption } from '../../redux/consumption/actions';
import { AppState } from '../../redux/rootReducer';
import yup from '../../utils/yup';
import moment from 'moment';
import { PageContainer, FormImageContainer } from './styles';
import { ConsumptionFamilySearch } from '../../components/consumptionFamilySearch';
import { CameraUpload } from './cameraUpload';

const schema = yup.object().shape({
  nfce: yup.string().label('Nota fiscal eletrônica'),
  value: yup.number().label('Valor em reais').min(0).required(),
  proofImageUrl: yup.string().label('Link da imagem'),
  familyId: yup.string().label('Família').required('É preciso selecionar uma família ao digitar um NIS'),
  birthday: yup.string().label('Aniversário')
});

/**
 * Clear NFCe QRCode result
 * @param value url
 */
const handleQRCode = (value: string | null) => {
  if (!value) return null;
  return value;
  // https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200417745613005462650030000484351494810435|2|1|1|d3bfca6136abee66286116203f747bc8e6fd3300
  // const nfce = value.split('nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=')[1];
  // if (!nfce) return null; // Not a valid nfce QRCode
  // return nfce.split('|')[0];
};

/**
 * Dashboard page component
 * @param props component props
 */
export const ConsumptionForm: React.FC<RouteComponentProps<{ id: string }>> = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const cameraRef = useRef(null);

  // Local state
  const [permission, setPermission] = useState<string>('');
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Redux state
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familiesReducer.familyItem);

  useEffect(() => {
    navigator.permissions
      .query({ name: 'camera' })
      .then((value) => {
        setPermission(value.state);
      })
      .catch((err) => console.log(err));
  }, []);

  const {
    handleSubmit,
    handleChange,
    values,
    getFieldMeta,
    submitForm,
    status,
    errors,
    touched,
    setFieldValue,
    getFieldProps
  } = useFormik({
    initialValues: {
      nfce: '',
      invalidValue: 0,
      value: 0,
      proofImageUrl: '',
      nisCode: '',
      familyId: '',
      birthday: '',
      acceptCheck: false
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      const invalidConsumptionValue = !!(family && family.balance && values.value > 0 && values.value > family.balance);
      if (!(!family || invalidConsumptionValue || !values.acceptCheck)) {
        dispatch(
          requestSaveConsumption(
            {
              nfce: values.nfce,
              value: Number(values.value),
              invalidValue: Number(values.value),
              proofImageUrl: values.proofImageUrl,
              familyId: values.familyId,
              reviewedAt: moment().toDate()
            },
            () => {
              Modal.success({ title: 'Consumo salvo com sucesso', onOk: () => history.push('/') });
            },
            () => setStatus('Ocorreu um erro ao confirmar consumo.')
          )
        );
      }
    }
  });

  const valueMeta = getFieldMeta('value');
  const invalidValueMeta = getFieldMeta('invalidValue');
  const imageMeta = getFieldMeta('proofImageUrl');
  const nfceMeta = getFieldMeta('nfce');

  const acceptCheckMeta = getFieldMeta('acceptCheck');
  const acceptCheckField = getFieldProps('acceptCheck');

  const invalidConsumptionValue = !!(family && family.balance && values.value > 0 && values.value > family.balance);
  const invalidValueConsumption = !!(values.value < values.invalidValue);

  return (
    <PageContainer>
      <Card title="Informar consumo">
        <form style={{ marginBottom: 20 }} onSubmit={handleSubmit}>
          <Form layout="vertical">
            <ConsumptionFamilySearch onFamilySelect={(id) => setFieldValue('familyId', id)} />
            {values.familyId && (
              <>
                <Form.Item
                  label="NFCe"
                  validateStatus={!!nfceMeta.error && !!nfceMeta.touched ? 'error' : ''}
                  help={!!nfceMeta.error && !!nfceMeta.touched ? nfceMeta.error : undefined}
                >
                  <Input
                    id="nfce"
                    name="nfce"
                    size="large"
                    onChange={handleChange}
                    value={values.nfce}
                    onPressEnter={submitForm}
                    disabled
                    addonAfter={
                      <Button
                        type="link"
                        disabled={!!values.proofImageUrl}
                        onClick={() => setShowQRCodeModal(true)}
                        icon={<QrcodeOutlined />}
                      />
                    }
                  />
                  <Modal
                    okButtonProps={{ disabled: true }}
                    okText="Confirmar"
                    cancelText="Cancelar"
                    onCancel={() => setShowQRCodeModal(false)}
                    visible={showQRCodeModal}
                  >
                    <>
                      {showQRCodeModal && // Necessary to disable the camera
                        (permission !== 'denied' ? (
                          <QrReader
                            delay={200}
                            resolution={800}
                            onError={console.error}
                            onScan={(item) => {
                              const nfce = handleQRCode(item);
                              if (nfce) {
                                setFieldValue('nfce', nfce);
                                setShowQRCodeModal(false);
                              } else console.log(new Date().getTime(), 'reading...');
                            }}
                          />
                        ) : (
                          <>
                            <Typography.Title level={3}>{' Acesso não permitido a câmera.'}</Typography.Title>
                            <Divider />
                            <Typography.Paragraph>
                              Para continuar é necessário acesso a câmera do aparelho.
                            </Typography.Paragraph>
                            <Typography>
                              <ul>
                                <li>
                                  Clique no ícone <WarningFilled /> próximo ao endereço do site.
                                </li>
                                <li>
                                  Acesse <span style={{ color: 'blue' }}>Configurações do site</span>
                                </li>
                                <li>
                                  Clique em <span style={{ color: 'blue' }}>Acessar sua câmera</span> e permita o
                                  acesso.
                                </li>
                                <li>Clique em Fechar e em seguida clique no botão de leitura novamente.</li>
                              </ul>
                            </Typography>
                          </>
                        ))}
                    </>
                  </Modal>
                </Form.Item>
                <Form.Item
                  label="Valor da compra"
                  validateStatus={(!!valueMeta.error && !!valueMeta.touched) || invalidConsumptionValue ? 'error' : ''}
                  help={
                    !!valueMeta.error && !!valueMeta.touched
                      ? valueMeta.error
                      : invalidConsumptionValue
                      ? 'Valor maior que saldo disponível'
                      : undefined
                  }
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    id="value"
                    name="value"
                    size="large"
                    onChange={(value) => setFieldValue('value', value)}
                    value={Number(values.value)}
                    decimalSeparator=","
                    step={0.01}
                    precision={2}
                    min={0}
                    // max={family?.balance}
                    formatter={(value) => {
                      if (value === '') return `R$ `;
                      return value && Number(value) !== 0 && !Number.isNaN(Number(value)) ? `R$ ${value}` : '';
                    }}
                    parser={(value) => (value ? value.replace(/(R)|(\$)/g, '').trim() : '')}
                  />
                </Form.Item>
                <Form.Item
                  label="Valor total dos items inválidos"
                  validateStatus={
                    (!!invalidValueMeta.error && !!invalidValueMeta.touched) || invalidValueConsumption ? 'error' : ''
                  }
                  help={
                    !!invalidValueMeta.error && !!invalidValueMeta.touched
                      ? invalidValueMeta.error
                      : invalidValueConsumption
                      ? 'Valor maior que o valor da compra'
                      : undefined
                  }
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    id="invalidValue"
                    name="invalidValue"
                    size="large"
                    onChange={(value) => setFieldValue('invalidValue', value)}
                    value={Number(values.invalidValue)}
                    decimalSeparator=","
                    step={0.01}
                    min={0}
                    precision={2}
                    formatter={(value) =>
                      value && Number(value) !== 0 && !Number.isNaN(Number(value)) ? `R$ ${value}` : ''
                    }
                    parser={(value) => (value ? value.replace(/(R)|(\$)/g, '').trim() : '')}
                  />
                </Form.Item>
                <Form.Item
                  validateStatus={!!imageMeta.error && !!imageMeta.touched ? 'error' : ''}
                  help={!!imageMeta.error && !!imageMeta.touched ? imageMeta.error : undefined}
                >
                  <Button
                    size="large"
                    style={{ width: '100%' }}
                    onClick={() => setShowCameraModal(true)}
                    disabled={!!values.nfce}
                    icon={<CameraOutlined />}
                  >
                    {values.proofImageUrl ? 'Alterar foto dos comprovantes' : 'Adicionar foto dos comprovantes'}
                  </Button>
                  <Modal
                    okText={
                      showCamera ? (
                        <>
                          <CameraOutlined style={{ marginRight: 10 }} />
                          Tirar Foto
                        </>
                      ) : (
                        'Confirmar'
                      )
                    }
                    cancelText="Cancelar"
                    onCancel={() => {
                      setShowCameraModal(false);
                      setShowCamera(false);
                    }}
                    onOk={async () => {
                      if (values.proofImageUrl) {
                        setShowCameraModal(false);
                        return;
                      }
                      if (cameraRef && cameraRef.current) {
                        // weird ts error
                        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                        // @ts-ignore
                        const imageUri = cameraRef.current.getScreenshot();
                        setShowCameraModal(false);
                        setFieldValue('proofImageUrl', imageUri);
                      }
                    }}
                    visible={showCameraModal}
                  >
                    <FormImageContainer>
                      {showCamera ? (
                        <Webcam audio={false} width="100%" ref={cameraRef} />
                      ) : (
                        <CameraUpload onSetImage={(image: string) => setFieldValue('proofImageUrl', image)} />
                      )}
                    </FormImageContainer>
                    {showCamera ? (
                      <Button onClick={() => setShowCamera(false)}>
                        <UploadOutlined />
                        Enviar arquivo
                      </Button>
                    ) : (
                      <Button onClick={() => setShowCamera(true)}>
                        <CameraOutlined />
                        Usar camera
                      </Button>
                    )}
                    <Typography.Paragraph style={{ marginTop: 10 }}>
                      Na foto, tentar mostrar:
                      <ul>
                        <li>Nota fiscal</li>
                      </ul>
                      Tente manter a foto o mais nítida possível.
                    </Typography.Paragraph>
                  </Modal>
                </Form.Item>
                {values.proofImageUrl.length > 0 && (
                  <Form.Item>
                    <img alt="example" style={{ width: '100%', maxWidth: '600px' }} src={values.proofImageUrl} />
                  </Form.Item>
                )}
                <Form.Item
                  validateStatus={!!acceptCheckMeta.error && !!acceptCheckMeta.touched ? 'error' : ''}
                  help={!!acceptCheckMeta.error && !!acceptCheckMeta.touched ? acceptCheckMeta.error : undefined}
                >
                  <Checkbox checked={values.acceptCheck} {...acceptCheckField}>
                    Apenas itens contemplados pelo o programa estão incluídos na compra que está sendo inserida
                  </Checkbox>
                </Form.Item>
              </>
            )}
          </Form>
          <Flex alignItems="center" justifyContent="flex-end">
            <Button
              htmlType="submit"
              disabled={
                !!(errors && Object.keys(errors).length > 0 && touched) ||
                !family ||
                invalidConsumptionValue ||
                !(!!values.proofImageUrl || !!values.nfce) ||
                !values.acceptCheck
              }
              type="primary"
            >
              Confirmar consumo
            </Button>
          </Flex>
        </form>
        {status && <Alert message="Erro no formulário" description={status} type="error" />}
      </Card>
    </PageContainer>
  );
};
