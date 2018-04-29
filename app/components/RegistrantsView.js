import React from 'react';
import PropTypes from 'prop-types';
import { observable, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Icon from 'material-ui/Icon';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import PrintIcon from '@material-ui/icons/Print';
import Typography from 'material-ui/Typography';
import {
  DataTypeProvider,
  FilteringState,
  IntegratedFiltering,
  RowDetailState,
  PagingState,
  SortingState,
  IntegratedPaging,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableFilterRow,
  TableRowDetail,
  VirtualTable,
  PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';

import RowDetail from './RowDetail';

let checkIn;
const getRowId = row => row.paddedRegId;
const styles = theme => ({
  card: {
    marginBottom: 10,
  },
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

const rowStyles = {
  here: {
    backgroundColor: '#A5D6A7',
  }
};

const TableRow = ({ row, ...restProps }) => (
  <Table.Row
    {...restProps}
    // eslint-disable-next-line no-alert
    style={{
      cursor: 'pointer',
      backgroundColor: (row.attend) ? '#A5D6A7' : null,
    }}
  />
);

const RegistrantsView = inject('store')(observer(({ classes, store }) => {
  const { registrants } = store;
  checkIn = store.checkInRegistrant;
  const columns = [
    {
      name: 'icons',
      getCellValue: row => (row),
    },
    {
      name: 'displayId',
      title: 'Registrant ID'
    },
    {
      name: 'confirmation',
      title: 'Confirmation'
    },
    {
      name: 'groupConfirm',
      title: 'Group #'
    },
    {
      name: 'lastname',
      title: 'Last Name'
    },
    {
      name: 'firstname',
      title: 'First Name'
    },
    {
      name: 'organization',
      title: 'Company'
    },
  ];
  const iconColumns = ['icons'];
  const filteringStateColumnExtensions = [
    { columnName: 'icons', filteringEnabled: false },
  ];

  const IconFormatter = ({ value }) => (
    <React.Fragment>
      {value.attend ?
        <IconButton
          aria-label="Checked In"
          onClick={(...args) => checkIn(value.paddedRegId, false)}
        >
          <CheckCircleIcon />
        </IconButton>
        :
        <IconButton
          aria-label="Not Checked In"
          onClick={(...args) => checkIn(value.paddedRegId, true)}
        >
          <RemoveCircleIcon />
        </IconButton>
      }
      {value.transactions.length > 0 ?
        <IconButton
          aria-label="Paid"
        >
          <MonetizationOnIcon />
        </IconButton> : null
      }
      <IconButton
        aria-label="Print Badge"
        onClick={(...args) =>printBadge(value)}
      >
        <PrintIcon />
      </IconButton>
    </React.Fragment>
  );
  
  const IconTypeProvider = props => (
    <DataTypeProvider
      formatterComponent={IconFormatter}
      {...props}
    />
  );
  
  const changeCurrentPage = currentPage => store.page.current = currentPage;
  const changePageSize = pageSize => store.page.size = pageSize;
  const changeExpandedDetails = expandedRowIds => store.updateExpandedRows(expandedRowIds);
  const changeFilters = filters => store.updateFilters(filters);
  const changeSorting = sorting => {
    store.sorting = sorting;
  };
  const handleChange = (event) => {
    store.updateNoConflict(event.target.checked);
  };

  const printBadge = (reg) => {
    store.printBadge(reg);
  };

  return (
    <Paper>
      <Grid
        rows={store.db.getData('registrants')}
        columns={columns}
        getRowId={getRowId}
      >
        <FilteringState
          onFiltersChange={changeFilters}
          columnExtensions={filteringStateColumnExtensions}
        />
        <IconTypeProvider
            for={iconColumns}
          />
        <RowDetailState
          expandedRowIds={toJS(store.expandedRows)}
          onExpandedRowIdsChange={changeExpandedDetails}
        />
        <PagingState
          currentPage={toJS(store.page.current)}
          onCurrentPageChange={changeCurrentPage}
          pageSize={toJS(store.page.size)}
          onPageSizeChange={changePageSize}
        />
        <SortingState
          sorting={toJS(store.sorting)}
          onSortingChange={changeSorting}
        />
        <IntegratedPaging />
        <Table rowComponent={TableRow} />
        <TableHeaderRow showSortingControls />
        <TableFilterRow />
        <TableRowDetail
          contentComponent={RowDetail}
        />
        <PagingPanel
          pageSizes={toJS(store.page.sizes)}
        />
      </Grid>
    </Paper>
  );
}));

RegistrantsView.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RegistrantsView);
