import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Input, Button, Form, Typography } from 'antd';

import { doLoginUser } from '../../redux/auth/actions';
import { AppState } from '../../redux/rootReducer';

import { FormContainer, PageContainer } from './styles';

/**
 * Login page component
 * @param props component props
 */
export const LoginPage: React.FC<{}> = (props) => {
  // Local state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Redux state
  const dispatch = useDispatch();
  const loading = useSelector<AppState, boolean>((state) => state.authReducer.loading);
  const error = useSelector<AppState, Error | undefined>((state) => state.authReducer.error);
  return (
    <PageContainer>
      <Card>
        <FormContainer>
          <Form style={{ width: '300px' }}>
            <Form.Item>
              <Input
                size="large"
                value={email}
                placeholder={'Email'}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Input.Password
                size="large"
                value={password}
                placeholder={'Password'}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Form.Item>
            {error && (
              <Form.Item style={{ textAlign: 'center' }}>
                <Typography.Text type="danger">{error.message || 'Ocorreu um erro inesperado'}</Typography.Text>
              </Form.Item>
            )}
            <Button
              size="large"
              loading={loading}
              type="primary"
              onClick={() => dispatch(doLoginUser(email, password))}
              style={{ width: '100%' }}
            >
              Entrar
            </Button>
          </Form>
        </FormContainer>
      </Card>
    </PageContainer>
  );
};
