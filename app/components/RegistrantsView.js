import React from 'react';
import PropTypes from 'prop-types';
import { observable, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import PrintIcon from '@material-ui/icons/Print';
import Typography from '@material-ui/core/Typography';;
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import SaveAlt from "@material-ui/icons/SaveAlt";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Check from "@material-ui/icons/Check";
import FilterList from "@material-ui/icons/FilterList";
import Remove from "@material-ui/icons/Remove";
import Clear from "@material-ui/icons/Clear";
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
import MaterialTable from 'material-table'

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
  table: {
    maxWidth: '100%',
  },
  detail: {
    margin: theme.spacing.unit,
  }
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
      field: 'displayId',
      title: 'Registrant ID',
      customFilterAndSearch: (term, rowData) => store.updateFilters({term: term})
    },
    {
      field: 'confirmation',
      title: 'Confirmation'
    },
    {
      field: 'groupConfirm',
      title: 'Group #'
    },
    {
      field: 'lastname',
      title: 'Last Name'
    },
    {
      field: 'firstname',
      title: 'First Name'
    },
    {
      field: 'organization',
      title: 'Company'
    },
  ];
  const actions = [
    rowData => ({
      icon: rowData => rowData.attend ? <CheckCircleIcon /> : <RemoveCircleIcon />,
      tooltip: rowData => rowData.attend ? "Checked In" : "Not Checked In",
      onClick: (event, rowData) => checkIn(rowData.paddedRegId, (rowData.attend ? false : true)),
    }),
    rowData => ({
      icon: rowData => rowData.transactions && rowData.transactions.length > 0 ? <MonetizationOnIcon /> : null,
      tooltip: rowData => rowData.transactions && rowData.transactions.length > 0 ? "Paid" : "Not Paid",
    }),
    rowData => ({
      icon: () => <PrintIcon />,
      tooltip: 'Print Badge',
      onClick: (event, rowData) => printBadge(rowData),
    })
  ];
  const iconColumns = ['icons'];
  const filteringStateColumnExtensions = [
    { columnName: 'icons', filteringEnabled: false },
  ];


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
      <div>
        <MaterialTable
          icons={{
            Check: () => <Check />,
            Export: () => <SaveAlt />,
            Filter: () => <FilterList />,
            FirstPage: () => <FirstPage />,
            LastPage: () => <LastPage />,
            NextPage: () => <ChevronRight />,
            PreviousPage: () => <ChevronLeft />,
            Search: () => <Search />,
            ThirdStateCheck: () => <Remove />,
            ViewColumn: () => <ViewColumn />,
            DetailPanel: () => <ChevronRight />,
            ResetSearch: () => <Clear />,
          }}
          columns={columns}
          data={store.db.getData('registrants')}
          actions={actions}
          detailPanel={rowData => <div className={classes.detail}><RowDetail rowData={rowData}/></div>}
          options={{
            toolbar: false,
            search: false,
            rowStyle: rowData => ({
              cursor: 'pointer',
              backgroundColor: (rowData.attend) ? '#A5D6A7' : null,
            }),
            onChangeRowsPerPage: pageSize => console.log(pageSize),
          }}
          title="Registrants"
        />
      </div>
    </Paper>
  );
}));

RegistrantsView.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RegistrantsView);
