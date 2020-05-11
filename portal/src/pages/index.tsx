import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

// Pages
import { DashboardPage } from './dashboard';
import { ConsumptionForm } from './dashboard/form';

/**
 * Router component
 * @param props router props
 */
export const Router: React.FC<{}> = () => {
  return (
    <BrowserRouter>
      <Route component={DashboardPage} />
      <Route path="/novo" component={ConsumptionForm} />
    </BrowserRouter>
  );
};
