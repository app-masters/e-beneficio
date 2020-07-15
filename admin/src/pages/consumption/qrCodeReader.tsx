import React, { useState } from 'react';
import { Modal, Typography, Divider } from 'antd';
import QrReader from 'react-qr-reader';
import { logging } from '../../lib/logging';
import { WarningFilled } from '@ant-design/icons';

export interface ModalQrCodeProps {
  onClose: () => void;
  onQrRead: (nfce: string) => void;
  onInvalid: (message?: string) => void;
}

/**
 * Clear NFCe QRCode result
 * @param value url
 */
const handleQRCode = (value: string | null) => {
  if (!value) return null;
  if (value.indexOf('nfce.fazenda.mg.gov.br') < 0) {
    // Invalid QRCode
    return 'invalid';
  }
  return value;
};

/**
 * ModalQrCode component
 * @param props component props
 */
export const ModalQrCode: React.FC<ModalQrCodeProps> = ({ onClose, onInvalid, onQrRead }) => {
  const [permission, setPermission] = useState<string>('');
  // Check for ios so the user is advised to use another device
  const usingIOS = /(iPad|iPhone|iPod)/g.test(navigator?.userAgent || '');

  return (
    <Modal
      okButtonProps={{ disabled: true, hidden: true }}
      cancelText="Fechar"
      onCancel={onClose}
      visible={true}
      closable={false}
      maskClosable={false}
    >
      {// User needs to allow the user of the camera
      permission !== 'denied' &&
      // User device don't have a camera or it is not enabled (Apple errors falls here)
      permission !== 'unsupported' &&
      // Unknown error
      permission !== 'unknown' ? (
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
            onInvalid();
            if (nfce) {
              if (nfce !== 'invalid') {
                // Readed and it's a valid code
                onQrRead(nfce);
                onInvalid('');
                onClose();
              } else {
                // Readed but it's a invalid QRCode
                onClose();
                onInvalid(
                  'Esse código QRCode não tem os dados da nota fiscal da compra. Se sua nota fiscal não tem outro QRCode, precisamos que traga a nota para a Secreataria de Educação, no horário de 12:00 às 17:00 no endereço: Avenida Getúlio Vargas, 200 - Segundo piso, Centro - Espaço Mascarenhas'
                );
              }
            } else {
              // Not readed yet
              console.log(new Date().getTime(), 'reading...');
            }
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
