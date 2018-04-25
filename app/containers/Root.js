// @flow
import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import HashRouter from 'react-router-dom/HashRouter';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import ScrollToTop from '../components/ScrollToTop';
import Routes from '../routes';

type Props = {
  store: {},
  history: {}
};

const theme = createMuiTheme();

export default class Root extends Component<Props> {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={this.props.store}>
          <HashRouter history={this.props.history}>
            <ScrollToTop>
              <Routes />
            </ScrollToTop>
          </HashRouter>
        </Provider>
      </MuiThemeProvider>
    );
  }
}
