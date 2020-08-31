import React from 'react';
import { Button, Card, Typography, Table, Modal, Divider, notification } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { FamilySearch } from '../../components/familySearch';
import { Flex } from '../../components/flex';
import { Family, FamilyProductConsumption } from '../../interfaces/family';
import { requestSaveConsumptionProduct, requestClearConsumptionProduct } from '../../redux/consumption/actions';
import { AppState } from '../../redux/rootReducer';
import { PageContainer, FormImageContainer } from './styles';
import { NumberPicker } from '../../components/numberPicker';
import { Consumption } from '../../interfaces/consumption';
import { requestClearFamily } from '../../redux/family/actions';
import { UploadOutlined, CameraOutlined, WarningFilled } from '@ant-design/icons';
import { CameraUpload } from './cameraUpload';
import Webcam from 'react-webcam';
import { spacing } from '../../styles/theme';
import { VideoPermission } from '../../utils/camera';
import { logging } from '../../lib/logging';
import { isIOS } from '../../utils/platform';

/**
 * Dashboard page component
 * @param props component props
 */
export const ConsumptionForm: React.FC<RouteComponentProps<{ id: string }>> = () => {
  const [currentFamily, setFamily] = React.useState<number | string>();
  const history = useHistory();
  const dispatch = useDispatch();
  const family = useSelector<AppState, Family | null | undefined>(({ familyReducer }) => familyReducer.item);
  const consumption = useSelector<AppState, Consumption | undefined>(
    ({ consumptionReducer }) => consumptionReducer.item
  );

  const loading = useSelector<AppState, boolean>((state) => state.consumptionReducer.loading);

  React.useEffect(() => {
    if (consumption) {
      Modal.success({
        title: 'Consumo salvo com sucesso',
        maskClosable: false,
        onOk: () => {
          dispatch(requestClearConsumptionProduct());
          dispatch(requestClearFamily());
          history.push('/');
        }
      });
    }
  }, [dispatch, consumption, history]);

  return (
    <PageContainer>
      <Card title={<Typography.Title>{'Informar consumo'}</Typography.Title>}>
        <FamilySearch onFamilySelect={(id) => setFamily(id)} />
        {currentFamily && <ProductConsumption family={family} loading={loading} />}
      </Card>
    </PageContainer>
  );
};

/**
 * Product Consumption form
 * @param props component props
 */
const ProductConsumption: React.FC<{ family?: Family | null; loading?: boolean }> = ({ family, loading }) => {
  const cameraRef = React.useRef(null);
  const [permission, setPermission] = React.useState<string>('');
  const [consumerInfo, setConsumerInfo] = React.useState<{ image: string; error: boolean }>({
    image: '',
    error: false
  });
  const [showCameraModal, setShowCameraModal] = React.useState(false);
  const [showCamera, setShowCamera] = React.useState(false);
  const [dataSource, setDataSource] = React.useState<FamilyProductConsumption[] | undefined>(
    family?.balance as FamilyProductConsumption[]
  );

  const dispatch = useDispatch();

  /**
   * Function to change the consumed value
   */
  const onSubmitConsumption = () => {
    setConsumerInfo({ ...consumerInfo, error: false });
    console.log(dataSource);
    const verifyIfHaveSelected = (dataSource || []).filter((f) => Number(f.consume) > 0);
    if (verifyIfHaveSelected?.length === 0) {
      window.scrollTo(0, 0);
      notification.warning({ message: 'É necessário selecionar no mínimo 1 produto' });
      return;
    }
    if (!consumerInfo.image) {
      notification.warning({ message: 'É necessário o envio de uma foto do consumidor' });
      setConsumerInfo({ ...consumerInfo, error: true });
      return;
    }
    const consumption = {
      familyId: family?.id as number,
      proofImageUrl: consumerInfo.image,
      products: dataSource
        ? dataSource
            .map((item) => {
              return { id: item.product.id as number, amount: item.consume as number };
            })
            .filter((f) => f.amount)
        : []
    };
    dispatch(requestSaveConsumptionProduct(consumption));
  };

  /**
   * Function to change the consumed value
   */
  const onChangeItemValue = (value: number, productId: number) => {
    const list = JSON.parse(JSON.stringify(dataSource));
    const indexItem = dataSource?.findIndex((f) => f.product.id === productId);
    list[Number(indexItem)].consume = value;
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
          if (consumerInfo.image) {
            setShowCameraModal(false);
            return;
          }
          if (cameraRef && cameraRef.current) {
            // weird ts error
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            const image = cameraRef.current.getScreenshot();
            setShowCameraModal(false);
            setConsumerInfo({ error: false, image });
          }
        }}
        visible={showCameraModal}
      >
        {showCamera ? (
          <VideoPermission
            onSuccess={() => setPermission('granted')}
            onError={(error) => {
              if (error.name === 'NotAllowedError') setPermission('denied');
              else if (error.name === 'NotFoundError' || error.name === 'NoVideoInputDevicesError') {
                setPermission('unsupported');
              } else {
                setPermission('unknown');
                logging.error(error);
              }
            }}
          />
        ) : null}
        <FormImageContainer>
          {showCamera ? (
            permission === 'denied' ? (
              <Flex vertical>
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
              </Flex>
            ) : permission === 'granted' ? (
              <Webcam audio={false} width="100%" ref={cameraRef} />
            ) : null
          ) : (
            <CameraUpload onSetImage={(image: string) => setConsumerInfo({ error: false, image })} />
          )}
        </FormImageContainer>
        {showCamera ? (
          <Button onClick={() => setShowCamera(false)}>
            <UploadOutlined />
            Enviar arquivo
          </Button>
        ) : !isIOS() ? (
          <Button onClick={() => setShowCamera(true)}>
            <CameraOutlined />
            Usar camera
          </Button>
        ) : null}
        <Typography.Paragraph style={{ marginTop: 10 }}>
          Na foto, mostrar:
          <ul>
            <li>Rosto da pessoa que está realizando a compra.</li>
          </ul>
          Foque o rosto da pessoa em um local com bastante iluminação.
          <br />
          Tente manter a foto o mais nítida possível.
        </Typography.Paragraph>
      </Modal>
      <Divider />
      <h2>Produtos</h2>
      <Table
        locale={{ emptyText: 'Nenhum produto disponível' }}
        pagination={false}
        columns={columns}
        dataSource={dataSource && dataSource.length ? dataSource : []}
      />
      <Flex justifyContent="center" alignItems="center" style={{ marginTop: spacing.default }}>
        <Button
          danger={consumerInfo.error}
          size="large"
          icon={<CameraOutlined />}
          onClick={() => setShowCameraModal(true)}
        >
          {consumerInfo.image ? 'Alterar foto de comprovação' : 'Foto de comprovação'}
        </Button>
      </Flex>
      <Flex style={{ marginTop: 25 }} alignItems="center" justifyContent="flex-end">
        <Button loading={loading} onClick={onSubmitConsumption} htmlType="submit" type="primary">
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
