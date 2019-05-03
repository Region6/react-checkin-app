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
    { display: "Registrant ID", field: "displayId", dataType: "String" },
    { display: "Confirmation", field: "confirmation", dataType: "String" },
    { display: "Group #", field: "groupConfirm", dataType: "String" },
    { display: "Last Name", field: "lastName", dataType: "String" },
    { display: "First Name", field: "firstName", dataType: "String" },
    { display: "Company", field: "organization", dataType: "String" },
    { display: "Email", field: "email", dataType: "String" },
    { display: "Site ID", field: "siteId", dataType: "String" },
  ];

  const setSearchValue = (value) => {
    store.searchValue = toJS(value);
  };

  const search = (value) => {
    setSearchValue(value);
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
          searchFields={searchColumns}
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
