import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { observable, autorun, isObservable, observe } from 'mobx';
import { createHashHistory } from 'history';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import Root from './containers/Root';
import Store from './store';
import 'react-virtualized/styles.css'; // only needs to be imported once

const finishRender = async () => {
  await store.setup();
  render(
    <AppContainer>
      <Root store={store} history={browserHistory} />
    </AppContainer>,
    document.getElementById('root')
  );
}
const store = new Store();
const browserHistory = createHashHistory();
const routingStore = new RouterStore();
const history = syncHistoryWithStore(browserHistory, routingStore);

store.setBrowserHistory(history);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={browserHistory} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}

finishRender();
