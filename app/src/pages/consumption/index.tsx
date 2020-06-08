import { CameraOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Checkbox, Form, Input, InputNumber, Modal, Typography, Table } from 'antd';
import { useFormik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import QrReader from 'react-qr-reader';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FamilySearch } from '../../components/familySearch';
import { Flex } from '../../components/flex';
import { Family, FamilyProductConsumption } from '../../interfaces/family';
import { requestSaveConsumption, requestSaveConsumptionProduct } from '../../redux/consumption/actions';
import { AppState } from '../../redux/rootReducer';
import yup from '../../utils/yup';
import { PageContainer } from './styles';
import { NumberPicker } from '../../components/numberPicker';

const schema = yup.object().shape({
  nfce: yup.string().label('Nota fiscal eletrônica').required(),
  value: yup.number().label('Valor em reais').min(0).required(),
  proofImageUrl: yup.string().label('Link da imagem').required(),
  familyId: yup.string().label('Família').required('É preciso selecionar uma família ao digitar um NIS'),
  birthday: yup.string().label('Aniversário')
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
export const ConsumptionForm: React.FC<RouteComponentProps<{ id: string }>> = () => {
  const [currentFamily, setFamily] = React.useState<number | string>();
  const isTicket = process.env.REACT_APP_CONSUMPTION_TYPE === 'ticket';
  const family = useSelector<AppState, Family | null | undefined>((state) => state.familyReducer.item);
  return (
    <PageContainer>
      <Card title="Informar consumo">
        <FamilySearch onFamilySelect={(id) => setFamily(id)} />
        {currentFamily && <>{isTicket ? <FormBalance family={family} /> : <ProductConsumption family={family} />}</>}
      </Card>
    </PageContainer>
  );
};

/**
 * Balance form
 * @param props component props
 */
const FormBalance: React.FC<{ family?: Family | null }> = ({ family }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const cameraRef = useRef(null);

  // Local state
  const [, setPermission] = useState('prompt');
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

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
    setFieldValue,
    getFieldProps
  } = useFormik({
    initialValues: {
      nfce: '',
      value: 0,
      proofImageUrl: '',
      nisCode: '',
      familyId: '',
      birthday: '',
      acceptCheck: false
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      alert('AD');
      setStatus();
      const invalidConsumptionValue = !!(family && values.value > 0 && values.value > family.balance);
      if (!(!family || invalidConsumptionValue || !values.acceptCheck)) {
        dispatch(
          requestSaveConsumption(
            {
              nfce: values.nfce,
              value: Number(values.value),
              proofImageUrl: values.proofImageUrl,
              familyId: values.familyId
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

  const invalidConsumptionValue = !!(family && values.value > 0 && values.value > family.balance);

  const valueMeta = getFieldMeta('value');
  const imageMeta = getFieldMeta('proofImageUrl');
  const nfceMeta = getFieldMeta('nfce');

  const acceptCheckMeta = getFieldMeta('acceptCheck');
  const acceptCheckField = getFieldProps('acceptCheck');

  return (
    <form onSubmit={handleSubmit}>
      {status && <Alert message="Erro no formulário" description={status} type="error" />}
      <Form layout="vertical">
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
              addonAfter={<Button type="link" onClick={() => setShowQRCodeModal(true)} icon={<QrcodeOutlined />} />}
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
              formatter={(value) => `R$ ${value}`}
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
              icon={<CameraOutlined />}
            >
              {values.proofImageUrl ? 'Alterar foto dos comprovantes' : 'Adicionar foto dos comprovantes'}
            </Button>
            <Modal
              okText="Confirmar"
              cancelText="Cancelar"
              onCancel={() => setShowCameraModal(false)}
              onOk={async () => {
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
              <Typography.Paragraph>
                Na foto, tentar mostrar:
                <ul>
                  <li>Nota fiscal</li>
                  <li>Documento do comprador</li>
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
        <Flex alignItems="center" justifyContent="flex-end">
          <Button
            htmlType="submit"
            disabled={
              !!(errors && Object.keys(errors).length > 0 && touched) ||
              !family ||
              invalidConsumptionValue ||
              !values.acceptCheck
            }
            type="primary"
          >
            Confirmar consumo
          </Button>
        </Flex>
      </Form>
    </form>
  );
};

/**
 * Product Consumption form
 * @param props component props
 */
const ProductConsumption: React.FC<{ family?: Family | null }> = ({ family }) => {
  const [dataSource, setDataSource] = React.useState<FamilyProductConsumption[]>(
    family?.balance as FamilyProductConsumption[]
  );
  const dispatch = useDispatch();

  /**
   * Function to change the consumed value
   */
  const onSubmitConsumption = () => {
    const consumption = {
      familyId: family?.id as number,
      products: dataSource.map((item) => {
        return { id: item.product.id as number, amount: item.consume as number };
      })
    };
    dispatch(requestSaveConsumptionProduct(consumption));
  };

  /**
   * Function to change the consumed value
   */
  const onChangeItemValue = (value: number, productId: number) => {
    const list = JSON.parse(JSON.stringify(dataSource));
    const indexItem = dataSource.findIndex((f) => f.product.id === productId);
    list[indexItem].consume = value;
    setDataSource(list);
  };

  const columns = [
    {
      title: 'Produto',
      dataIndex: 'product',
      key: 'product',
      render: (text: FamilyProductConsumption['product']) => text.name
    },
    {
      title: 'Disponível',
      dataIndex: 'amountAvailable',
      key: 'amountAvailable'
    },
    {
      title: 'Consumir',
      key: 'action',
      render: (text: FamilyProductConsumption) => {
        return <NumberPickComponent defaultItem={text} onChange={onChangeItemValue} />;
      }
    }
  ];

  return (
    <div>
      <h2>Produtos</h2>
      <Table pagination={false} columns={columns} dataSource={dataSource} />
      <Flex style={{ marginTop: 25 }} alignItems="center" justifyContent="flex-end">
        <Button onClick={onSubmitConsumption} htmlType="submit" type="primary">
          Confirmar consumo
        </Button>
      </Flex>
    </div>
  );
};

/**
 * Pick component
 * @param props component props
 */
const NumberPickComponent: React.FC<{
  defaultItem: FamilyProductConsumption;
  onChange: (value: number, productId: number) => void;
}> = ({ defaultItem, onChange }) => {
  const [value, setValue] = React.useState<number>(0);
  return (
    <NumberPicker
      value={value}
      maxValue={defaultItem.amountAvailable}
      onChange={(value) => {
        setValue(value);
        onChange(value, defaultItem.product.id as number);
      }}
    />
  );
};
