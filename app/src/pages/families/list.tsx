import React from 'react';
import { PageContainer } from './styles';
import { Card, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

/**
 * Families page component
 * @param props component props
 */
export const FamiliesPage: React.FC<{}> = () => {
  return (
    <PageContainer>
      <Card
        title={<Typography.Title>{`Familias`}</Typography.Title>}
        extra={
          <Link to={`/familias/criar`}>
            <Button type="primary">Criar</Button>
          </Link>
        }
      />
    </PageContainer>
  );
};
