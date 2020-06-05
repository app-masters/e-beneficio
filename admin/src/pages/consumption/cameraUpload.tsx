import React from 'react';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

/**
 * CameraUpload component
 */
export const CameraUpload: React.FC<{ onSetImage: (imageUrl: string) => void }> = ({ onSetImage }) => {
  const [image, setImage] = React.useState<{ imageUrl: string; loading: boolean }>({
    loading: false,
    imageUrl: ''
  });

  /**
   * Base64
   */
  const getBase64 = (img: File, callback: (result: string | ArrayBuffer | null) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  /**
   * Before upload
   */
  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Só é possível enviar imagens');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('A imagem deve ser menor que 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  /**
   * Change image
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (info: any) => {
    getBase64(info.file.originFileObj, (imageUrl) => {
      onSetImage(imageUrl as string);
      setImage({
        imageUrl: imageUrl as string,
        loading: false
      });
    });
  };

  const uploadButton = (
    <div style={{ textAlign: 'center' }}>
      {image.loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="ant-upload-text">Enviar arquivo</div>
    </div>
  );

  return (
    <Upload
      name="avatar"
      showUploadList={false}
      // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {image.imageUrl ? (
        <div style={{ textAlign: 'center' }}>
          <img src={image.imageUrl as string} alt="avatar" width={'100%'} />
          <small>Clique na imagem para enviar novamente</small>
        </div>
      ) : (
        uploadButton
      )}
    </Upload>
  );
};
