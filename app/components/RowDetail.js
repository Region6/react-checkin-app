import React from 'react';
import PropTypes from 'prop-types';
import { observable, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withStyles } from 'material-ui/styles';
import ButtonBase from 'material-ui/ButtonBase';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Icon from 'material-ui/Icon';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import PrintIcon from '@material-ui/icons/Print';
import Typography from 'material-ui/Typography';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import { withRouter } from 'react-router';

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

const RowDetail = inject('store')(observer(({ classes, store, row, history }) => {
  const printBadge = async () => store.printBadge(row);
  const printReceipt = () => store.printReceipt(row);
  const showReceipt = () => {
    let modal = window.open('', 'view');
    modal.document.write(store.renderReceipt(row));
  }
  const showBadge = async () => {
    let modal = window.open('', 'view');
    const badge = await store.renderBadge(row);
    modal.document.write(badge);
  }
  const editRegistrant = () => history.push(`/registrant/${row.paddedRegId}`);
  const payment = () => history.push(`/registrant/${row.paddedRegId}/payment`);
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
    <Grid container spacing={24}>
      <Grid item xs={12} md={4}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="title">
              Contact Info
            </Typography>
          </CardContent>
          <Divider />
          <CardContent>
            <Typography variant="body1">{row.title}</Typography>
            <Typography variant="body1">{row.address}</Typography>
            <Typography variant="body1">{row.address2}</Typography>
            <Typography variant="body1">{row.city}, {row.state} {row.zipcode}</Typography>
            <Typography variant="body1">{row.phone}</Typography>
            <Typography variant="body1">{row.email}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="title">
              Linked People
            </Typography>
          </CardContent>
          <Divider />
          <CardContent>
            <Table className={classes.table}>
              <TableBody>
                {row.linked.map(p => (
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
                          onClick={(...args) => store.checkInRegistrant(p.registrantId, false, row.registrantId)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        :
                        <IconButton
                          aria-label="Not Checked In"
                          onClick={(...args) => store.checkInRegistrant(p.registrantId, true, row.registrantId)}
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
          variant="raised"
          className={classes.button}
          onClick={editRegistrant}
        >
          Edit Registrant
        </Button>
        <Button
          variant="raised"
          className={classes.button}
          onClick={payment}
        >
          Make Payment
        </Button>
        <Button
          variant="raised"
          className={classes.button}
          onClick={printBadge}
        >
          Print Badge
        </Button>
        <Button
          variant="raised"
          className={classes.button}
          onClick={showBadge}
        >
          View Badge
        </Button>
        <Button
          variant="raised"
          className={classes.button}
          onClick={printReceipt}
        >
          Print Receipt
        </Button>
        <Button
          variant="raised"
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

export default withRouter(withStyles(styles)(RowDetail));
