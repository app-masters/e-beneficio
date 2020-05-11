import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Input, Button, Form, Typography } from 'antd';

import { requestLoginUser } from '../../redux/auth/actions';
import { AppState } from '../../redux/rootReducer';

import { FormContainer, PageContainer } from './styles';

/**
 * Login page component
 * @param props component props
 */
export const LoginPage: React.FC<{}> = () => {
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
          <Form
            name="login"
            style={{ width: '300px' }}
            onFinish={() => {
              dispatch(requestLoginUser(email, password));
            }}
          >
            <Form.Item>
              <Input
                size="large"
                value={email}
                required
                placeholder={'Email'}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Input.Password
                size="large"
                required
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
            <Form.Item>
              <Button size="large" loading={loading} htmlType="submit" type="primary" style={{ width: '100%' }}>
                Entrar
              </Button>
            </Form.Item>
          </Form>
        </FormContainer>
      </Card>
    </PageContainer>
  );
};
