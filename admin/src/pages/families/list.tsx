import { InboxOutlined, IdcardOutlined, TeamOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  Descriptions,
  List,
  Card,
  Spin,
  Typography,
  Upload,
  Button,
  Alert,
  Divider,
  Col,
  Row,
  Statistic,
  Tag,
  Progress
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSVReport } from '../../interfaces/csvReport';
import {
  requestUploadFamilyFile,
  doUploadFamilyFileRestart,
  requestGetDashboardFamily,
  requestStartImportReportSync,
  requestUploadSislameFile
} from '../../redux/families/actions';
import { AppState } from '../../redux/rootReducer';
import { PageContainer, ColAlignRight, CounterItem } from './styles';
import { Flex } from '../../components/flex';
import { DashboardFamily } from '../../interfaces/dashboardFamily';
import { familyGroupList } from '../../utils/constraints';
import moment from 'moment';
import { FamilySearch } from '../../components/familySearch';
import { Link } from 'react-router-dom';
import { spacing } from '../../styles/theme';
import { ImportReport } from '../../interfaces/family';
import { backend } from '../../utils/networking';

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

  const importReport = useSelector<AppState, ImportReport | undefined>(
    ({ familiesReducer }) => familiesReducer.importReport
  );
  const importReportLoading = useSelector<AppState, boolean>(
    ({ familiesReducer }) => familiesReducer.importReportLoading
  );

  const dashboardLoading = useSelector<AppState, boolean>(({ familiesReducer }) => familiesReducer.dashboardLoading);
  const dashboardData = useSelector<AppState, DashboardFamily | undefined>(
    ({ familiesReducer }) => familiesReducer.dashboard
  );

  const [importType, setImportType] = useState<'sislame' | 'cad'>('sislame');
  const [familyFile, setFamilyFile] = useState<File | null>(null);
  const [sislameFile, setSislameFile] = useState<File | null>(null);
  const [nurseryFile, setNurseryFile] = useState<File | null>(null);

  /**
   * Save files and upload if all are defined
   */
  useEffect(() => {
    if (familyFile && sislameFile && nurseryFile) {
      dispatch(requestUploadSislameFile(familyFile, sislameFile, nurseryFile));
      setFamilyFile(null);
      setSislameFile(null);
      setNurseryFile(null);
    }
  }, [dispatch, familyFile, sislameFile, nurseryFile]);

  useEffect(() => {
    dispatch(requestGetDashboardFamily());
    dispatch(requestStartImportReportSync());
  }, [dispatch]);

  /**
   * Get report tag color
   */
  const getTagColor = () => {
    if (importReport?.inProgress) {
      return 'processing';
    } else {
      if (importReport?.message) {
        return 'error';
      } else {
        return 'success';
      }
    }
  };

  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Typography.Title>{`Famílias`}</Typography.Title>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card loading={dashboardLoading}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title={familyGroupList['extreme-poverty'].title}
                  value={dashboardData?.['extreme-poverty']}
                />
              </Col>
              <Col span={8}>
                <Statistic title={familyGroupList['poverty-line'].title} value={dashboardData?.['poverty-line']} />
              </Col>
              <Col span={8}>
                <Statistic title={familyGroupList['cad'].title} value={dashboardData?.['cad']} />
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Typography.Text>Total: </Typography.Text>
                <Typography.Text>
                  {dashboardData?.total} {dashboardData?.total === 1 ? 'família' : 'famílias'}
                </Typography.Text>
              </Col>
              <Col span={12} style={ColAlignRight}>
                <Typography.Text>Última atualização: </Typography.Text>
                <Typography.Text>{moment(dashboardData?.lastCreatedDate).fromNow()}</Typography.Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={'Busca pelo NIS'}>
            <Row gutter={[16, 16]}>
              <Col flex={1}>
                <FamilySearch />
              </Col>
              <Col>
                <Link to={`/familias/criar`}>
                  <Button type="primary">Adicionar</Button>
                </Link>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      {importReport && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Relatório da importação" extra={importReportLoading ? <Spin size="small" /> : null}>
              <Descriptions bordered size="small" column={1} style={{ marginBottom: spacing.default }}>
                <Descriptions.Item label="Dependentes na base do Bolsa Família">
                  <CounterItem>{importReport.originalFamilyCount}</CounterItem>
                </Descriptions.Item>
                <Descriptions.Item label="Alunos na base do Sislame">
                  <CounterItem>{importReport.originalSislameCount}</CounterItem>
                </Descriptions.Item>
                <Descriptions.Item label="Crianças na base das Creches">
                  <CounterItem>{importReport.originalNurseryCount}</CounterItem>
                </Descriptions.Item>
              </Descriptions>
              <Descriptions bordered size="small" column={1} style={{ marginBottom: spacing.default }}>
                <Descriptions.Item label="Dependentes no Bolsa Família duplicados (mesmo NIS para responsável e dependente)">
                  <CounterItem>
                    {importReport.originalFamilyCount && importReport.originalFamilyCount > 0 && (
                      <Typography.Text type="secondary" style={{ marginRight: spacing.default }}>
                        {`(${((100 * (importReport.duplicatedCount || 0)) / importReport.originalFamilyCount).toFixed(
                          1
                        )}%)`}
                      </Typography.Text>
                    )}
                    {importReport.duplicatedCount}
                  </CounterItem>
                </Descriptions.Item>
                <Descriptions.Item label="Dependentes no Bolsa Família maiores de idade">
                  <CounterItem>{importReport.aboveAgeFamilyCount}</CounterItem>
                </Descriptions.Item>
                <Descriptions.Item label="Alunos sem nenhum responsável no Sislame">
                  <CounterItem>{importReport.sislameWithoutParentCount}</CounterItem>
                </Descriptions.Item>
                <Descriptions.Item label="Dependentes após filtros de idade e duplicidade">
                  <CounterItem bold>
                    {importReport.originalFamilyCount && importReport.originalFamilyCount > 0 && (
                      <Typography.Text type="secondary" style={{ marginRight: spacing.default }}>
                        {`(${(
                          (100 * (importReport.filteredFamilyCount || 0)) /
                          importReport.originalFamilyCount
                        ).toFixed(1)}%)`}
                      </Typography.Text>
                    )}
                    {importReport.filteredFamilyCount}
                  </CounterItem>
                </Descriptions.Item>
              </Descriptions>
              <Descriptions bordered size="small" column={1} style={{ marginBottom: spacing.default }}>
                <Descriptions.Item label="Dependentes não encontrado no Sislame">
                  <CounterItem>
                    {importReport.filteredFamilyCount && importReport.filteredFamilyCount > 0 && (
                      <Typography.Text type="secondary" style={{ marginRight: spacing.default }}>
                        {`(${(
                          (100 * (importReport.notFoundFamilyCount || 0)) /
                          importReport.filteredFamilyCount
                        ).toFixed(1)}%)`}
                      </Typography.Text>
                    )}
                    {importReport.notFoundFamilyCount}
                  </CounterItem>
                </Descriptions.Item>
                <Descriptions.Item label="Alunos maiores de idade apenas no Sislame">
                  <CounterItem>
                    {importReport.filteredFamilyCount && importReport.filteredFamilyCount > 0 && (
                      <Typography.Text type="secondary" style={{ marginRight: spacing.default }}>
                        {`(${(
                          (100 * (importReport.aboveAgeSislameCount || 0)) /
                          importReport.filteredFamilyCount
                        ).toFixed(1)}%)`}
                      </Typography.Text>
                    )}
                    {importReport.aboveAgeSislameCount}
                  </CounterItem>
                </Descriptions.Item>
                <Descriptions.Item label="Dependentes com nome encontrado, mas responsável não">
                  <CounterItem>
                    {importReport.filteredFamilyCount && importReport.filteredFamilyCount > 0 && (
                      <Typography.Text type="secondary" style={{ marginRight: spacing.default }}>
                        {`(${(
                          (100 * (importReport.foundOnlyNameFamilyCount || 0)) /
                          importReport.filteredFamilyCount
                        ).toFixed(1)}%)`}
                      </Typography.Text>
                    )}
                    {importReport.foundOnlyNameFamilyCount}
                  </CounterItem>
                </Descriptions.Item>
                <Descriptions.Item label="Dependentes com 14 anos ou menos removidos">
                  <CounterItem>{importReport.fourteenOrLessFilteredCount}</CounterItem>
                </Descriptions.Item>
              </Descriptions>
              <Descriptions bordered size="small" column={1} style={{ marginBottom: spacing.default }}>
                <Descriptions.Item label="Dependentes beneficiados">
                  <CounterItem bold>
                    {importReport.filteredFamilyCount && importReport.filteredFamilyCount > 0 && (
                      <Typography.Text type="secondary" style={{ marginRight: spacing.sm }}>
                        {`(${((100 * (importReport.dependentsCount || 0)) / importReport.filteredFamilyCount).toFixed(
                          1
                        )}%)`}
                      </Typography.Text>
                    )}
                    {importReport.dependentsCount}
                  </CounterItem>
                </Descriptions.Item>
                <Descriptions.Item label="Famílias beneficiadas">
                  <CounterItem>{importReport.grantedFamilyCount}</CounterItem>
                </Descriptions.Item>
                <Descriptions.Item label="Depedentes já beneficiados por outro responsável">
                  <CounterItem>{importReport.grantedAnotherParentCount}</CounterItem>
                </Descriptions.Item>
                <Descriptions.Item label="Dependentes com 14 anos ou menos beneficiados">
                  <CounterItem>
                    {importReport.dependentsCount && importReport.dependentsCount > 0 && (
                      <Typography.Text type="secondary" style={{ marginRight: spacing.sm }}>
                        {`(${(
                          (100 * (importReport.fourteenOrLessGrantedCount || 0)) /
                          importReport.dependentsCount
                        ).toFixed(1)}%)`}
                      </Typography.Text>
                    )}
                    {importReport.fourteenOrLessGrantedCount}
                  </CounterItem>
                </Descriptions.Item>
              </Descriptions>
              <Flex gap>
                <Progress
                  percent={Number(((importReport.percentage || 0) * 100).toFixed(2))}
                  status={!importReport.percentage ? (importReport.message ? 'exception' : 'success') : 'active'}
                />
                <Flex justifyContent="flex-end" style={{ width: '200px' }}>
                  <Tag color={getTagColor()}>{importReport.status}</Tag>
                </Flex>
              </Flex>
              {importReport.message && (
                <Alert
                  message="Erro na importação"
                  description={importReport.message}
                  type="error"
                  style={{ marginBottom: spacing.default }}
                />
              )}
              {!importReport.inProgress &&
                !importReport.message &&
                importReport.notFoundFamilyCount &&
                importReport.notFoundFamilyCount > 0 && (
                  <Flex style={{ marginTop: spacing.default }}>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        backend.get(`/static/reason_${importReport.cityId}.csv`).then((response) => {
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `relatorio_${moment().format('YYYYMMDDHHmmss')}.csv`);
                          document.body.appendChild(link);
                          link.click();
                        })
                      }
                    >
                      Fazer download do último relatório de motivos
                    </Button>
                  </Flex>
                )}
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={'Importar Familias'}>
            {error && (
              <Alert
                message="Erro no formulário"
                description={error}
                type="error"
                style={{ marginBottom: spacing.default }}
              />
            )}
            {uploadReport ? (
              <>
                <Descriptions
                  bordered
                  title="Relatório dos registros"
                  size="small"
                  column={4}
                  style={{ marginBottom: spacing.default }}
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
                    style={{ marginBottom: spacing.default }}
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
                <Spin spinning={loading || importReport?.inProgress}>
                  <Flex full gap justifyContent="flex-end" style={{ marginBottom: spacing.default }}>
                    <Button disabled={importType === 'sislame'} onClick={() => setImportType('sislame')}>
                      Bolsa Família com Sislame
                    </Button>
                    <Button disabled={importType === 'cad'} onClick={() => setImportType('cad')}>
                      CAD único
                    </Button>
                  </Flex>
                  {importType === 'sislame' && (
                    <Flex full gap>
                      <div style={{ flex: 1 }}>
                        <Dragger
                          id="file"
                          name="file"
                          accept=".csv"
                          action={undefined}
                          showUploadList={false}
                          customRequest={({ file }) => setFamilyFile(file)}
                        >
                          <p className="ant-upload-drag-icon">
                            <IdcardOutlined />
                          </p>
                          <p className="ant-upload-text">Clique ou arraste um arquivo da base do Bolsa Família</p>
                          <p className="ant-upload-hint">O arquivo precisa ser do tipo CSV</p>
                          {familyFile && (
                            <Tag
                              color="processing"
                              style={{ marginTop: spacing.default }}
                            >{`Arquivo selectionado: ${familyFile.name}`}</Tag>
                          )}
                        </Dragger>
                      </div>
                      <div style={{ flex: 1 }}>
                        <Dragger
                          id="file"
                          name="file"
                          accept=".csv"
                          action={undefined}
                          showUploadList={false}
                          customRequest={({ file }) => setSislameFile(file)}
                        >
                          <p className="ant-upload-drag-icon">
                            <TeamOutlined />
                          </p>
                          <p className="ant-upload-text">Clique ou arraste um arquivo da base do Sislame</p>
                          <p className="ant-upload-hint">O arquivo precisa ser do tipo CSV</p>
                          {sislameFile && (
                            <Tag
                              color="processing"
                              style={{ marginTop: spacing.default }}
                            >{`Arquivo selectionado: ${sislameFile.name}`}</Tag>
                          )}
                        </Dragger>
                      </div>
                      <div style={{ flex: 1 }}>
                        <Dragger
                          id="file"
                          name="file"
                          accept=".csv"
                          action={undefined}
                          showUploadList={false}
                          customRequest={({ file }) => setNurseryFile(file)}
                        >
                          <p className="ant-upload-drag-icon">
                            <TeamOutlined />
                          </p>
                          <p className="ant-upload-text">Clique ou arraste um arquivo da base das Creches</p>
                          <p className="ant-upload-hint">O arquivo precisa ser do tipo CSV</p>
                          {nurseryFile && (
                            <Tag
                              color="processing"
                              style={{ marginTop: spacing.default }}
                            >{`Arquivo selectionado: ${nurseryFile.name}`}</Tag>
                          )}
                        </Dragger>
                      </div>
                    </Flex>
                  )}
                  {importType === 'cad' && (
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
                  )}
                </Spin>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};
