/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { observer, inject } from 'mobx-react';
import { Switch, Route } from 'react-router';
import App from './containers/App';
import Dashboard from './containers/Dashboard';
import Payment from './containers/Payment';
import UpdateRegistrant from './containers/UpdateRegistrant';
import Admin from './containers/Admin';

export default inject('store')(observer(({ store }) => {
  const UpdateRegistrantBefore = ({ component: Component, ...rest }) => {
    store.createNewRegistrant();
    return (<Route {...rest} render={(props) => (<Component {...props} />)} />);
  };

  const SetRegistrantBefore = ({ component: Component, ...rest }) => {
    store.setRegistrant(rest.computedMatch.params.id);
    return (<Route {...rest} render={(props) => (<Component {...props} />)} />);
  };

  return (
    <App>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/registrant/add" component={UpdateRegistrant} />
        <Route exact path="/registrant/:id" component={UpdateRegistrant} />
        <Route exact path="/registrant/:id/payment" component={Payment} />
        <Route exact path="/admin" component={Admin} />
      </Switch>
    </App>
  );
}));
