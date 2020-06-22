import React from 'react';
import { PageContainer } from '../styles';
import { Card, Typography, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';

/**
 * ReportList page
 */
export const ReportList: React.FC<{}> = () => {
  return (
    <PageContainer>
      <Card title={<Typography.Title>Relatórios</Typography.Title>}>
        <Row gutter={[16, 16]}>
          <Col>
            <Link to="relatorios/consumo-familia">
              <Button size={'large'}>Consumo por familia</Button>
            </Link>
          </Col>
          <Col>
            <Link to="relatorios/consumo-estabelecimento">
              <Button size={'large'}>Consumo por estabelecimento</Button>
            </Link>
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};
