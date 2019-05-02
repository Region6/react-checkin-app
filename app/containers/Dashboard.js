import React from 'react';
import PropTypes from 'prop-types';
import { observable, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import RefreshIcon from '@material-ui/icons/Refresh';
import { AutoSizer } from 'react-virtualized';
import LogiFilterBuilder from 'logi-filter-builder';

import RegistrantsView from '../components/RegistrantsView';
import SearchBar from '../components/SearchBar';


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

  const searchColumns = [
    { header: "Registrant ID", accessor: "displayId", dataType: "String" },
    { header: "Confirmation", accessor: "confirmation", dataType: "String" },
    { header: "Group #", accessor: "groupConfirm", dataType: "String" },
    { header: "Last Name", accessor: "lastName", dataType: "String" },
    { header: "First Name", accessor: "firstName", dataType: "String" },
    { header: "Company", accessor: "company", dataType: "String" },
  ];

  const setSearchValue = (value) => {
    store.searchValue = toJS(value);
  };

  const search = () => {
    store.updateFilters([toJS(store.searchValue)]);
    store.filterRegistrants();
  };

  const cancelSearch = () => {
    store.resetData();
  };

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
        <SearchBar
          value={toJS(store.searchValue)}
          onChange={setSearchValue}
          onRequestSearch={search}
          onCancelSearch={cancelSearch}
        />
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
