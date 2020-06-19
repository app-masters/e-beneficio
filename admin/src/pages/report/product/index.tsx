import React from 'react';
import { PageContainer } from '../styles';
import { Card, Row, Col, Typography } from 'antd';
import { Link } from 'react-router-dom';

/**
 * ReportList page
 */
export const ReportList: React.FC<{}> = () => {
  return (
    <PageContainer>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Link to="relatorios/consumo">
            <Card>
              <Typography.Title>Consumo por Familia</Typography.Title>
            </Card>
          </Link>
        </Col>
      </Row>
    </PageContainer>
  );
};
