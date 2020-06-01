import { QrcodeOutlined, WarningFilled, CheckOutlined } from '@ant-design/icons';
import { Button, Modal, Row, Col, Typography, Form, InputNumber, Divider, Alert } from 'antd';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import QrReader from 'react-qr-reader';
import { useSelector, useDispatch } from 'react-redux';
import { FamilySearch } from '../../components/familyValidation';
import { Family } from '../../interfaces/family';
import { AppState } from '../../redux/rootReducer';
import yup from '../../utils/yup';
import { requestSaveConsumption } from '../../redux/consumption/actions';
import { requestResetFamily } from '../../redux/family/actions';
import { IconCheckStyle, ImageContainer, PriceStyle, PriceLabelStyle } from './styles';
import { logging } from '../../utils/logging';

/**
 * Clear NFCe QRCode result
 * @param value url
 */
const handleQRCode = (value: string | null) => {
  if (!value) return null;
  return value;
  // // https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200417745613005462650030000484351494810435|2|1|1|d3bfca6136abee66286116203f747bc8e6fd3300
  // const nfce = value.split('nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=')[1];
  // if (!nfce) return null; // Not a valid nfce QRCode
  // return nfce.split('|')[0];
};

/**
 * Dashboard page component
 * @param props component props
 */
export const ConsumptionForm: React.FC<{ closeModal: Function }> = ({ closeModal }) => {
  const [familyId, setFamilyId] = useState<string | number | undefined>();
  const [pickQr, setPickQr] = useState<string>('');

  const dispatch = useDispatch();

  /**
   * Close modal
   */
  const close = () => {
    closeModal();
    dispatch(requestResetFamily());
  };

  return (
    <Modal title={'Informar compra'} visible={true} centered maskClosable={false} onCancel={close} footer={null}>
      <FamilySearch onFamilySelect={(id) => setFamilyId(id)} />
      {familyId && pickQr === '' && <StepQRCodeChose onPick={(pick) => setPickQr(pick)} />}
      {pickQr === 'withoutQr' && <StepNoQRCode onBack={() => setPickQr('')} onConfirm={close} />}
      {pickQr === 'withQr' && <StepWithQRCode onBack={() => setPickQr('')} onFinish={close} />}
    </Modal>
  );
};

/**
 * StepQRCodeChose component
 * @param props component props
 */
export const StepQRCodeChose: React.FC<{ onPick: (pick: string) => void }> = ({ onPick }) => {
  return (
    <div>
      <Typography.Paragraph style={{ marginBottom: 0 }}>
        No comprovante da sua compra, verifique se está presente o código QRCode. O código consuma estar na parte de
        baixo da nota e parece com o seguinte:
      </Typography.Paragraph>
      <ImageContainer>
        <img src={require('../../assets/qrCodeImage.png')} alt="QRCode" height="80%" style={{ maxHeight: 200 }} />
      </ImageContainer>
      <Row typeof="flex" gutter={[16, 16]}>
        <Col span={'24'}>
          <Button block onClick={() => onPick('withQr')}>
            Meu comprovante tem o QRCode
          </Button>
        </Col>
        <Col span={'24'}>
          <Button block onClick={() => onPick('withoutQr')}>
            Meu comprovante não tem o QRCode
          </Button>
        </Col>
      </Row>
    </div>
  );
};

/**
 * StepNoQRCode component
 * @param props component props
 */
export const StepNoQRCode: React.FC<{ onBack: () => void; onConfirm: () => void }> = ({ onBack, onConfirm }) => {
  return (
    <div>
      <Typography.Paragraph>
        Sem o QRCode, precisamos que você entregue o comprovante da sua compra para que um responsável possa adicionar
        sua compra na lista da recarga. Junto com a nota fiscal, traga seu documento.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Entregue sua nota fiscal na Secreataria de Educação, no horário de 12:00 às 17:00 no endereço:
        <b> Avenida Getúlio Vargas, 200 - Segundo piso, Centro - Espaço Mascarenhas</b>
      </Typography.Paragraph>
      <Row typeof="flex" gutter={[16, 16]}>
        <Col span={'12'}>
          <Button block onClick={onBack}>
            Voltar
          </Button>
        </Col>
        <Col span={'12'}>
          <Button block type="primary" onClick={onConfirm}>
            Concluir
          </Button>
        </Col>
      </Row>
    </div>
  );
};

const schema = yup.object().shape({
  nfce: yup.string().label('Nota fiscal eletrônica').required(),
  value: yup.number().label('Valor em reais').min(0).required()
});

/**
 * StepWithQRCode component
 * @param props component props
 */
export const StepWithQRCode: React.FC<{ onBack: () => void; onFinish: () => void }> = ({ onBack, onFinish }) => {
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familyReducer.item);
  const [showQRModal, setQRModal] = React.useState<boolean>(false);

  const dispatch = useDispatch();

  const { handleSubmit, values, getFieldMeta, status, setFieldValue } = useFormik({
    initialValues: {
      nfce: '',
      value: ''
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      setStatus();
      const invalidConsumptionValue = !!(family && Number(values.value) > family.balance);
      if (family && !invalidConsumptionValue) {
        const data = {
          nfce: values.nfce,
          value: Number(values.value),
          familyId: Number(family?.id)
        };
        dispatch(
          requestSaveConsumption(
            data,
            () => {
              Modal.success({ title: 'Consumo salvo com sucesso', onOk: () => onFinish() });
            },
            (error) => {
              if (error && error.message.indexOf('409') > -1) {
                setStatus('Essa nota fiscal já está vinculada no nosso sistema');
              } else {
                setStatus('Ocorreu um erro durante o processamento. Por favor tente novamente em algumas horas');
              }
            }
          )
        );
      }
    }
  });

  const valueMeta = getFieldMeta('value');
  const nfceMeta = getFieldMeta('nfce');

  const invalidConsumptionValue = !!(family && Number(values.value) > 0 && Number(values.value) > family.balance);
  return (
    <Form layout="vertical" onSubmitCapture={handleSubmit}>
      {status && <Alert message="Erro no formulário" description={status} type="error" />}
      <Form.Item>
        <Typography.Text style={PriceLabelStyle}>{'Saldo disponível: '}</Typography.Text>
        <Typography.Text style={PriceStyle}>{`R$${(family?.balance || 0)
          .toFixed(2)
          .replace('.', ',')}`}</Typography.Text>
      </Form.Item>
      <Form.Item
        label="Valor total da compra"
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
          type="numeric"
          onChange={(val) => {
            if (val && Number(val) !== 0 && !Number.isNaN(Number(val))) setFieldValue('value', val);
            else setFieldValue('value', '');
          }}
          value={Number(values.value)}
          decimalSeparator=","
          step={0.01}
          precision={2}
          min={0}
          formatter={(value) => (value && Number(value) !== 0 && !Number.isNaN(Number(value)) ? `R$ ${value}` : '')}
          parser={(value) => (value ? value.replace(/(R)|(\$)/g, '').trim() : '')}
        />
      </Form.Item>

      <Form.Item
        label={
          <>
            {'Nota fiscal (NFCe)'}
            {values.nfce && <CheckOutlined style={IconCheckStyle} />}
          </>
        }
        validateStatus={!!nfceMeta.error && !!nfceMeta.touched ? 'error' : ''}
        help={!!nfceMeta.error && !!nfceMeta.touched ? nfceMeta.error : undefined}
      >
        <Button icon={<QrcodeOutlined />} block onClick={() => setQRModal(true)}>
          Ler código QRCode
        </Button>
        {showQRModal && (
          <ModalQrCode onQrRead={(nfce) => setFieldValue('nfce', nfce)} onClose={() => setQRModal(false)} />
        )}
      </Form.Item>

      <Form.Item style={{ marginTop: 10, marginBottom: 0, textAlign: 'right' }}>
        <Row typeof="flex" gutter={[16, 16]}>
          <Col span={'12'}>
            <Button block onClick={onBack}>
              Voltar
            </Button>
          </Col>
          <Col span={'12'}>
            <Button
              block
              type="primary"
              // disabled={values.nfce === ''}
              htmlType={'submit'}
            >
              Confirmar
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

/**
 * ModalQrCode component
 * @param props component props
 */
export const ModalQrCode: React.FC<{ onClose: () => void; onQrRead: (nfce: string) => void }> = ({
  onClose,
  onQrRead
}) => {
  const [permission, setPermission] = useState<string>('');

  // Check for ios so the user is advised to use another device
  const usingIOS = /(iPad|iPhone|iPod)/g.test(navigator?.userAgent || '');

  return (
    <Modal
      okButtonProps={{ disabled: true, hidden: true }}
      cancelText="Fechar"
      maskClosable={false}
      closable={false}
      onCancel={onClose}
      visible={true}
    >
      {// User needs to allow the user of the camera
      permission !== 'denied' &&
      // User device don't have a camera or it is not enabled (Apple errors falls here)
      permission !== 'unsupported' &&
      // Unknown error
      permission !== 'unknown' ? (
        // Necessary to disable the camera
        <QrReader
          delay={200}
          resolution={800}
          onError={(error) => {
            if (error.name === 'NotAllowedError') setPermission('denied');
            else if (error.name === 'NotFoundError' || error.name === 'NoVideoInputDevicesError') {
              setPermission('unsupported');
            } else {
              setPermission('unknown');
              logging.error(error);
            }
          }}
          onScan={(item) => {
            const nfce = handleQRCode(item);
            if (nfce) {
              onQrRead(nfce);
              onClose();
            } else console.log(new Date().getTime(), 'reading...');
          }}
        />
      ) : permission === 'denied' ? (
        <>
          <Typography.Title level={3}>{' Acesso não permitido a câmera.'}</Typography.Title>
          <Divider />
          <Typography.Paragraph>Para continuar é necessário acesso a câmera do aparelho.</Typography.Paragraph>
          <Typography>
            <ul>
              <li>
                Clique no ícone <WarningFilled /> próximo ao endereço do site.
              </li>
              <li>
                Acesse <span style={{ color: 'blue' }}>Configurações do site</span>
              </li>
              <li>
                Clique em <span style={{ color: 'blue' }}>Acessar sua câmera</span> e permita o acesso.
              </li>
              <li>Clique em Fechar e em seguida clique no botão de leitura novamente.</li>
            </ul>
          </Typography>
        </>
      ) : (
        <>
          <Typography.Title level={3}>{'Falha ao acessar a câmera.'}</Typography.Title>
          <Divider />
          {usingIOS ? (
            <Typography.Paragraph>
              Infelizmente aparelhos iOS ainda não são suportados, tente acessar o site por outro aparelho
            </Typography.Paragraph>
          ) : (
            <>
              <Typography.Paragraph>Ocorreu um erro ao acessar a câmera do aparelho.</Typography.Paragraph>
              <Typography.Paragraph>
                Verifique se a câmera do seu aparelho está funcionando corretamente. Se o erro continuar, tente acessar
                o site por outro dispositivo
              </Typography.Paragraph>
            </>
          )}
        </>
      )}
    </Modal>
  );
};
