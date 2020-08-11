import { CameraOutlined, QrcodeOutlined, UploadOutlined, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Typography, Spin, Upload, Select } from 'antd';
import { useFormik } from 'formik';
import { IdcardOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Flex } from '../../components/flex';
import { Family } from '../../interfaces/family';
import { requestSaveConsumption, requestTicketReportFile } from '../../redux/consumption/actions';
import { AppState } from '../../redux/rootReducer';
import yup from '../../utils/yup';
import moment from 'moment';
import { PageContainer, FormImageContainer } from './styles';
import { ConsumptionFamilySearch } from '../../components/consumptionFamilySearch';
import { CameraUpload } from './cameraUpload';
import { User } from '../../interfaces/user';
import { ModalQrCode } from './qrCodeReader';

const { Dragger } = Upload;
const { Option } = Select;

const schema = yup.object().shape({
  nfce: yup.string().label('Nota fiscal eletrônica'),
  value: yup.number().label('Valor em reais').min(0).required(),
  invalidValue: yup.number().label('Valor em reais'),
  proofImageUrl: yup.string().label('Link da imagem'),
  familyId: yup.string().label('Família').required('É preciso selecionar uma família ao digitar um NIS'),
  birthday: yup.string().label('Aniversário')
});

/**
 * Dashboard page component
 * @param props component props
 */
export const ConsumptionForm: React.FC<RouteComponentProps<{ id: string }>> = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const cameraRef = useRef(null);

  // Local state
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const [month, setMonth] = useState<string>(moment().month().toString());

  // Redux state
  const loggedUser = useSelector<AppState, User | undefined>((state) => state.authReducer.user);
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familiesReducer.familyItem);
  const loading = useSelector<AppState, boolean>((state) => state.consumptionReducer.loading);
  const error = useSelector<AppState, Error | undefined>((state) => state.consumptionReducer.error);

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
    setStatus
  } = useFormik({
    initialValues: {
      nfce: '',
      invalidValue: 0,
      value: 0,
      proofImageUrl: '',
      nisCode: '',
      familyId: '',
      birthday: '',
      acceptCheck: true
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      if (!!family) {
        dispatch(
          requestSaveConsumption(
            {
              nfce: values.nfce,
              value: Number(values.value),
              invalidValue: Number(values.invalidValue),
              proofImageUrl: values.proofImageUrl,
              familyId: values.familyId,
              reviewedAt: moment().toDate()
            },
            () => {
              Modal.success({ title: 'Consumo salvo com sucesso', onOk: () => history.push('/') });
            },
            (error) => {
              if (error && error.message.indexOf('409') > -1) {
                setStatus('Essa nota fiscal já foi informada. QRCode repetido.');
              } else {
                setStatus('Ocorreu um erro ao confirmar consumo.');
              }
            }
          )
        );
      }
    }
  });

  const valueMeta = getFieldMeta('value');
  const invalidValueMeta = getFieldMeta('invalidValue');
  const imageMeta = getFieldMeta('proofImageUrl');
  const nfceMeta = getFieldMeta('nfce');

  const invalidValueConsumption = !!(values.value < values.invalidValue);

  return (
    <PageContainer>
      <Card title={<Typography.Title>Informar consumo</Typography.Title>}>
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
                  {showQRCodeModal && (
                    <ModalQrCode
                      onQrRead={(nfce) => setFieldValue('nfce', nfce)}
                      onClose={() => setShowQRCodeModal(false)}
                      onInvalid={setStatus}
                    />
                  )}
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
                    min={0}
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
                      ? 'Valor total será maior que valor possível do benefício'
                      : !!values.nfce
                      ? 'Valor inválido definido pela nota fiscal'
                      : undefined
                  }
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    id="invalidValue"
                    name="invalidValue"
                    size="large"
                    disabled={!!values.nfce}
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
                    style={{ width: '100%', marginTop: '20px' }}
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
                        const imageUri = cameraRef.current.getScreenshot({ width: 900, height: 600 });
                        setShowCameraModal(false);
                        setFieldValue('proofImageUrl', imageUri);
                      }
                    }}
                    visible={showCameraModal}
                  >
                    <FormImageContainer>
                      {showCamera ? (
                        <Webcam
                          screenshotQuality={0.85}
                          videoConstraints={{ facingMode: cameraFacingMode }}
                          audio={false}
                          width="100%"
                          ref={cameraRef}
                        />
                      ) : (
                        <CameraUpload onSetImage={(image: string) => setFieldValue('proofImageUrl', image)} />
                      )}
                    </FormImageContainer>
                    {showCamera ? (
                      <Flex justifyContent="space-between">
                        <Button onClick={() => setShowCamera(false)}>
                          <UploadOutlined />
                          Enviar arquivo
                        </Button>
                        <Button
                          onClick={() => setCameraFacingMode(cameraFacingMode === 'user' ? 'environment' : 'user')}
                        >
                          <ReloadOutlined style={{ fontSize: '0.6rem' }} />
                          Alternar câmera
                        </Button>
                      </Flex>
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
              </>
            )}
          </Form>
          <Flex alignItems="center" justifyContent="flex-end">
            <Button
              htmlType="submit"
              disabled={!!(errors && Object.keys(errors).length > 0 && touched) || !family || !values.value}
              type="primary"
            >
              Confirmar consumo
            </Button>
          </Flex>
        </form>
        {status && <Alert message="Erro no formulário" description={status} type="error" />}
      </Card>
      {loggedUser && loggedUser.role !== 'operator' && (
        <Card
          title="Relatório de consumo Ticket"
          style={{ marginTop: '20px' }}
          extra={
            <>
              <Typography.Text>Mês base: </Typography.Text>
              <Select disabled={loading} onSelect={(value) => setMonth(value)} value={month}>
                {moment.months().map((item) => (
                  <Option key={item} value={moment().month(item).format('M')}>
                    {item}
                  </Option>
                ))}
              </Select>
            </>
          }
        >
          <Spin spinning={loading}>
            <Flex full gap>
              <div style={{ flex: 1 }}>
                <Dragger
                  id="file"
                  name="file"
                  accept=".csv"
                  action={undefined}
                  showUploadList={false}
                  customRequest={({ file }) => dispatch(requestTicketReportFile(file, month.toString()))}
                >
                  <p className="ant-upload-drag-icon">
                    <IdcardOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Clique ou arraste um arquivo de consumos da Ticket para gerar o relatório
                  </p>
                  <p className="ant-upload-hint">O arquivo precisa ser do tipo CSV</p>
                </Dragger>
              </div>
            </Flex>
          </Spin>
          {error && <Alert message="Erro no envio" description={error.message} type="error" />}
        </Card>
      )}
    </PageContainer>
  );
};
