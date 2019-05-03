import React from 'react';
import PropTypes from 'prop-types';
import { observable, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import PrintIcon from '@material-ui/icons/Print';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { navigate } from './routerHistory';

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
    minWidth: 100,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  detail: {
    margin: theme.spacing.unit,
  }
});

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const RowDetail = inject('store')(observer(({ classes, store, rowData }) => {
  const printBadge = async () => store.printBadge(rowData);
  const printReceipt = () => store.printReceipt(rowData);
  const showReceipt = () => {
    let modal = window.open('', 'view');
    const html = store.renderReceipt(rowData);
    setTimeout(() => {
      modal.document.write(html);
      },
      500
    );
  }
  const showBadge = async () => {
    let modal = window.open('', 'view');
    const badge = await store.renderBadge(rowData);
    setTimeout(() => {
        modal.document.write(badge);
      },
      500
    );
  }
  const editRegistrant = () => navigate(`/registrant/${rowData.paddedRegId}`);
  const payment = () => navigate(`/registrant/${rowData.paddedRegId}/payment`);
  const goToRegistrant = (regId) => (e) => {
    store.filters = [];
    store.filters.push(
      {
        columnName: 'displayId',
        value: regId,
      }
    );
  }
  return (
    <Grid container spacing={8}>
      <Grid item xs={12} md={4}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="h6">
              Contact Info
            </Typography>
          </CardContent>
          <Divider />
          <CardContent>
            <Typography variant="body2">{rowData.title}</Typography>
            <Typography variant="body2">{rowData.address}</Typography>
            <Typography variant="body2">{rowData.address2}</Typography>
            <Typography variant="body2">{rowData.city}, {rowData.state} {rowData.zipcode}</Typography>
            <Typography variant="body2">{rowData.phone}</Typography>
            <Typography variant="body2">{rowData.email}</Typography>
            {rowData.site.length ?
              <div>
                <Typography variant="body2">{rowData.site[0].siteId}</Typography>
                <Typography variant="body2">R{rowData.site[0].region}{rowData.site[0].memberType}</Typography>
              </div> : null
            }
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="h6">
              Linked People
            </Typography>
          </CardContent>
          <Divider />
          <CardContent>
            <Table className={classes.table}>
              <TableBody>
                {rowData.linked.map(p => (
                  <TableRow
                    hover
                    className={classes.row}
                    key={p.id}
                    style={{backgroundColor: (p.attend) ? '#A5D6A7' : null}}
                  >
                    <CustomTableCell>
                      <ButtonBase
                        onClick={goToRegistrant(p.registrantId)}
                      >
                        {p.registrantId}
                      </ButtonBase>
                    </CustomTableCell>
                    <CustomTableCell>
                      <ButtonBase
                        onClick={goToRegistrant(p.registrantId)}
                      >
                        {p.lastname}, {p.firstname}
                      </ButtonBase>
                    </CustomTableCell>
                    <CustomTableCell>
                      {p.attend ?
                        <IconButton
                          aria-label="Checked In"
                          onClick={(...args) => store.checkInRegistrant(p.registrantId, false, rowData.registrantId)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        :
                        <IconButton
                          aria-label="Not Checked In"
                          onClick={(...args) => store.checkInRegistrant(p.registrantId, true, rowData.registrantId)}
                        >
                          <RemoveCircleIcon />
                        </IconButton>
                      }
                      <IconButton
                        aria-label="Print Badge"
                        onClick={(...args) => store.printBadge(p)}
                      >
                        <PrintIcon />
                      </IconButton>
                    </CustomTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={12}>
        <Button
          variant="contained"
          className={classes.button}
          onClick={editRegistrant}
        >
          Edit Registrant
        </Button>
        <Button
          variant="contained"
          className={classes.button}
          onClick={payment}
        >
          Make Payment
        </Button>
        <Button
          variant="contained"
          className={classes.button}
          onClick={printBadge}
        >
          Print Badge
        </Button>
        <Button
          variant="contained"
          className={classes.button}
          onClick={showBadge}
        >
          View Badge
        </Button>
        <Button
          variant="contained"
          className={classes.button}
          onClick={printReceipt}
        >
          Print Receipt
        </Button>
        <Button
          variant="contained"
          className={classes.button}
          onClick={showReceipt}
        >
          View Receipt
        </Button>
      </Grid>
    </Grid>
  );
}));

RowDetail.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RowDetail);
