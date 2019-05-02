// @flow
import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import { LocationProvider } from '@reach/router';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import App from './App';
import ScrollToTop from '../components/ScrollToTop';
import Routes from '../routes';

type Props = {
  store: {},
  history: {}
};

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
});

export default class Root extends Component<Props> {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Provider store={this.props.store}>
          <LocationProvider history={this.props.history}>
            <ScrollToTop>
              <App>
                <Routes />
              </App>
            </ScrollToTop>
          </LocationProvider>
        </Provider>
      </MuiThemeProvider>
    );
  }
}
