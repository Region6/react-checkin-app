import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observable, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Button from 'material-ui/Button';
import ButtonBase from 'material-ui/ButtonBase';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';
import Icon from 'material-ui/Icon';
import RefreshIcon from '@material-ui/icons/Refresh';
import { FormControl, FormHelperText, FormControlLabel, FormGroup } from 'material-ui/Form';
import { AutoSizer } from 'react-virtualized';

import FileUpload from '../components/FileUpload';


const styles = theme => ({
  card: {
    marginBottom: 10,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
  },
  button: {
    margin: theme.spacing.unit,
  },
  breadCrumbs: theme.typography.caption,
  input: {
    display: 'none',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
  },
});

@inject('store')
@observer
class Admin  extends Component {
  @observable type = '';
  @observable exhibitorPage = 0;
  @observable fileInput;

  componentDidMount() {
    const { store } = this.props;
    store.getAttendeeCount(true);
  }

  downloadTransactions = (e) => {
    const { store } = this.props;
    store.downloadTransactions();
  }

  handleTypeChange = (e) => {
    this.type = e.target.value;
  }

  updateExhPage = (e) => {
    this.exhibitorPage = parseInt(e.target.value, 10);
  }

  render() {
    const { classes, store, match, history } = this.props;
    const { registrants } = store;
    const goBack = () => history.push('/dashboard');

    const printBadges = async () => {
      let registrants = await store.getExhibitors(this.exhibitorPage);
      registrants = store.db.getData('registrants');
      const badge = await store.printBadge(registrants);
      // let modal = window.open('', 'view');
      // modal.document.write(badge);
    }

    const onChange = async (e) => {
      const data = new FormData();
      data.append('file', e.target.files[0]);
      if (this.type.length) {
        await store.importData(this.type, data);
      }
      this.fileInput.value = "";
    }

    return (
      <Grid container spacing={24}>
        <Grid item xs={12}>
          <Card className={classes.card}>
            <CardContent>
              <ButtonBase
                className={classes.breadCrumbs}
                onClick={goBack}
              >
                Dashboard > 
              </ButtonBase>
              <Typography variant="headline">
                Admin
              </Typography>
            </CardContent>
            <Divider />
            <CardContent>
              <Select
                value={this.type}
                displayEmpty
                onChange={this.handleTypeChange}
              >
                <MenuItem value="">
                  Select Type
                </MenuItem>
                <MenuItem value="registrants">
                  Import General Registrants
                </MenuItem>
                <MenuItem value="exhibitors">
                  Import Exhibitor Companies
                </MenuItem>
                <MenuItem value="exhibitorAttendees">
                  Import Exhibitor Registrants
                </MenuItem>
                <MenuItem value="transactions">
                  Import Payment Transactions
                </MenuItem>
              </Select>
              <input
                className={classes.input}
                id="raised-button-file"
                multiple
                type="file"
                onChange={onChange}
                ref={ref => this.fileInput = ref}
              />
              <label htmlFor="raised-button-file">
                <Button variant="raised" component="span" className={classes.button}>
                  Upload
                </Button>
              </label>
            </CardContent>
            <Divider />
            <CardContent>
              <div className={classes.container}>
                <Button
                  variant="raised"
                  className={classes.button}
                  onClick={this.downloadTransactions}
                >
                  Sync Transactions from AuthorizeNet
                </Button>
              </div>
            </CardContent>
            <Divider />
            <CardContent>
              <div className={classes.container}>
                <Typography variant="title">
                  Batch Exhibitor Badge Printing
                </Typography>
                <Select
                  value={this.exhibitorPage}
                  displayEmpty
                  onChange={this.updateExhPage}
                  fullWidth
                >
                  <MenuItem value="">
                    Select Batch
                  </MenuItem>
                  {store.getExhPrintPages().map(p =>
                    <MenuItem value={p} key={p}>
                      {p+1}
                    </MenuItem>
                  )}
                </Select>

                <Button
                  variant="raised"
                  className={classes.button}
                  onClick={printBadges}
                >
                  Print Exhibitor Badges
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
};

Admin.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Admin);