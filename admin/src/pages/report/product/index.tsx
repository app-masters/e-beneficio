import React from 'react';
import { PageContainer } from '../styles';
import { Card, Typography, Button } from 'antd';
import { Link } from 'react-router-dom';

/**
 * ReportList page
 */
export const ReportList: React.FC<{}> = () => {
  return (
    <PageContainer>
      <Card title={<Typography.Title>Relatórios</Typography.Title>}>
        <Link to="relatorios/consumo">
          <Button size={'large'}>Consumo por Familia</Button>
        </Link>
      </Card>
    </PageContainer>
  );
};
