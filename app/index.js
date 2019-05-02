import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { observable, autorun, isObservable, observe } from 'mobx';

import { history } from './components/routerHistory'
import Root from './containers/Root';
import Store from './store';
import 'react-virtualized/styles.css'; // only needs to be imported once

const store = new Store();


const finishRender = async () => {
  await store.setup();
  render(
    <AppContainer>
      <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
  );
}
//store.setBrowserHistory(history);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}

finishRender();
