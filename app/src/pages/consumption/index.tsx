import React, { useState, useEffect, useRef } from 'react';
import { Alert, Button, Card, Descriptions, Form, Input, Typography, InputNumber, Modal } from 'antd';
import { useFormik } from 'formik';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import QrReader from 'react-qr-reader';
import Webcam from 'react-webcam';
import { QrcodeOutlined, CameraOutlined } from '@ant-design/icons';
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
  value: yup.number().label('Valor em reais').required(),
  proofImageUrl: yup.string().label('Link da imagem').required(),
  familyId: yup.string().label('Família').required('É preciso selecionar uma família ao digitar um NIS')
});

/**
 * Clear NFCe QRCode result
 * @param value url
 */
const handleQRCode = (value: string | null) => {
  if (!value) return null;
  // https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200417745613005462650030000484351494810435|2|1|1|d3bfca6136abee66286116203f747bc8e6fd3300
  const nfce = value.split('nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=')[1];
  if (!nfce) return null; // Not a valid nfce QRCode
  return nfce.split('|')[0];
};

/**
 * Dashboard page component
 * @param props component props
 */
export const ConsumptionForm: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const cameraRef = useRef(null);

  // Local state
  const [nis, setNis] = useState('');
  const [permission, setPermission] = useState('prompt');
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  // Redux state
  const familyLoading = useSelector<AppState, boolean>((state) => state.familyReducer.loading);
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familyReducer.item);

  useEffect(() => {
    navigator.permissions.query({ name: 'camera' }).then((value) => {
      setPermission(value.state);
    });
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
                    addonAfter={
                      <Button type="link" onClick={() => setShowQRCodeModal(true)} icon={<QrcodeOutlined />} />
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
                      {showQRCodeModal && ( // Necessary to disable the camera
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
                      )}
                      {process.env.NODE_ENV === 'development' ? 'Permission: ' + permission : null}
                    </>
                  </Modal>
                </Form.Item>
                <Form.Item
                  label="Valor da compra"
                  validateStatus={!!valueMeta.error && !!valueMeta.touched ? 'error' : ''}
                  help={!!valueMeta.error && !!valueMeta.touched ? valueMeta.error : undefined}
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
                    formatter={(value) => `R$ ${value}`}
                    parser={(value) => (value ? value.replace(/(R)|(\$)/g, '').trim() : '')}
                  />
                </Form.Item>

                <Form.Item
                  label="Foto dos comprovantes"
                  validateStatus={!!imageMeta.error && !!imageMeta.touched ? 'error' : ''}
                  help={!!imageMeta.error && !!imageMeta.touched ? imageMeta.error : undefined}
                >
                  <Input
                    id="proofImageUrl"
                    name="proofImageUrl"
                    size="large"
                    onChange={handleChange}
                    value={values.proofImageUrl}
                    addonAfter={
                      <Button type="link" onClick={() => setShowCameraModal(true)} icon={<CameraOutlined />} />
                    }
                  />

                  <Modal
                    okText="Confirmar"
                    cancelText="Cancelar"
                    onCancel={() => setShowCameraModal(false)}
                    onOk={() => {
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
                    {showCameraModal && <Webcam audio={false} width="100%" ref={cameraRef} />}
                  </Modal>
                </Form.Item>
                <Form.Item>
                  {values.proofImageUrl.length > 0 && (
                    <img alt="example" style={{ width: '100%', maxWidth: '600px' }} src={values.proofImageUrl} />
                  )}
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
