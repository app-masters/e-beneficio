import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

// Pages
import { DashboardPage } from './dashboard';
import { InstructionsPage } from './instructions';

/**
 * Router component
 * @param props router props
 */
export const Router: React.FC<{}> = () => {
  return (
    <BrowserRouter>
      <Route path="/passo-a-passo" component={InstructionsPage} />
      <Route path="/" component={DashboardPage} exact />
    </BrowserRouter>
  );
};
