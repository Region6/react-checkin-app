/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { observer, inject } from 'mobx-react';
import { createHistory, Link, LocationProvider, Router } from '@reach/router';

import Dashboard from './containers/Dashboard';
import Payment from './containers/Payment';
import UpdateRegistrant from './containers/UpdateRegistrant';
import Admin from './containers/Admin';

const UpdateRegistrantBefore = inject('store')(({ store, id }) => {
  store.siteIdQuery = '';
  store.userIdQuery = '';
  if (id) {
    store.setRegistrant(id);
  } else {
    store.createNewRegistrant();
  }
  return <UpdateRegistrant />;
});

const PaymentBefore = inject('store')(({ store, id }) => {
  if (id) {
    store.setRegistrant(id);
  }
  return <Payment />;
});

const Routes = () => (
  <Router>
    <Dashboard path="/" />
    <Dashboard path="/dashboard" />
    <UpdateRegistrantBefore path="/registrant/add" />
    <UpdateRegistrantBefore path="/registrant/:id" />
    <PaymentBefore path="/registrant/:id/payment" />
    <Admin path="/admin" />
  </Router>
);

export default Routes;
