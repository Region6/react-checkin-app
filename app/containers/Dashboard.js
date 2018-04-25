import React from 'react';
import PropTypes from 'prop-types';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Icon from 'material-ui/Icon';
import RefreshIcon from '@material-ui/icons/Refresh';
import { AutoSizer } from 'react-virtualized';

import RegistrantsView from '../components/RegistrantsView';


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
  buttonRight: {
    margin: theme.spacing.unit,
    marginLeft: 0,
    float: 'right',
  },
});

const Dashboard = inject('store')(observer(({ classes, store }) => {
  const { registrants } = store;

  const handleChange = (event) => {
    store.updateNoConflict(event.target.checked);
  };
  const resetData = () => {
    store.resetData();
  }

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <Button
          className={classes.buttonRight}
          color="default"
          onClick={resetData}
        >
          <RefreshIcon className={classes.leftIcon} />
          Reset Data
        </Button>
      </Grid>
      <Grid item xs={12}>
        <RegistrantsView />
      </Grid>
      <Grid item xs={12}>
      </Grid>
    </Grid>
  );
}));

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);
