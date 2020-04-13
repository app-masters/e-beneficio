import { InboxOutlined } from '@ant-design/icons';
import { Descriptions, List, Card, Spin, Typography, Upload, Button, Alert } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSVReport } from '../../interfaces/csvReport';
import { requestUploadFamilyFile, doUploadFamilyFileRestart } from '../../redux/families/actions';
import { AppState } from '../../redux/rootReducer';
import { PageContainer } from './styles';
import { Flex } from '../../components/flex';

const { Dragger } = Upload;

/**
 * List component
 * @param props component props
 */
export const FamiliesList: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const loading = useSelector<AppState, boolean>(({ familiesReducer }) => familiesReducer.loading);
  const error = useSelector<AppState, string | undefined>(({ familiesReducer }) => familiesReducer.error);
  const uploadReport = useSelector<AppState, CSVReport | undefined>(
    ({ familiesReducer }) => familiesReducer.uploadReport
  );

  return (
    <PageContainer>
      <Card title={<Typography.Title>{`Famílias`}</Typography.Title>}>
        {error && (
          <Alert message="Erro no formulário" description={error} type="error" style={{ marginBottom: '20px' }} />
        )}
        {uploadReport ? (
          <>
            <Descriptions
              bordered
              title="Relatório dos registros"
              size="small"
              column={4}
              style={{ marginBottom: '20px' }}
            >
              <Descriptions.Item label="Criados">{uploadReport.created}</Descriptions.Item>
              <Descriptions.Item label="Atualizados">{uploadReport.updated}</Descriptions.Item>
              <Descriptions.Item label="Removidos">{uploadReport.deleted}</Descriptions.Item>
              <Descriptions.Item label="Errados">{uploadReport.wrong}</Descriptions.Item>
            </Descriptions>
            {uploadReport.report && uploadReport.report.length > 0 && (
              <List
                size="small"
                bordered
                dataSource={uploadReport.report}
                renderItem={(item) => <List.Item>{item}</List.Item>}
                style={{ marginBottom: '20px' }}
              />
            )}
            <Flex alignItems="center" justifyContent="flex-end">
              <Button
                htmlType="button"
                // disabled={!!(errors && Object.keys(errors).length > 0 && touched) || !family || invalidConsumptionValue}
                type="primary"
                onClick={() => dispatch(doUploadFamilyFileRestart())}
              >
                Enviar novamente
              </Button>
            </Flex>
          </>
        ) : (
          <>
            <Spin spinning={loading}>
              <Dragger
                id="file"
                name="file"
                accept=".csv"
                action={undefined}
                showUploadList={false}
                customRequest={({ file }) => dispatch(requestUploadFamilyFile(file))}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Clique ou arraste um arquivo nesta área para enviar</p>
                <p className="ant-upload-hint">O arquivo precisa ser do tipo CSV</p>
              </Dragger>
            </Spin>
          </>
        )}
      </Card>
    </PageContainer>
  );
};
