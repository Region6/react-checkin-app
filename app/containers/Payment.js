import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observable, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MaskedInput from 'react-text-mask';
import NumberFormat from 'react-number-format';
import Cards from 'react-credit-cards';
import CreditCardInput from 'react-credit-card-input';

import { navigate } from '../components/routerHistory';

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
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  selectFormControl: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 4,
  },
  margin: {
    margin: theme.spacing.unit,
  },
  withoutLabel: {
    marginTop: theme.spacing.unit * 3,
  },
  suggestionsContainer: {
    flexGrow: 1,
    position: 'relative',
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3,
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  tab: {
    marginTop: 15,
  },
});

const TextMaskCustom = (props) => {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={ref => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[/[0-9]/, /\d/, '/', /\d/, /\d/]}
      placeholderChar={'\u2000'}
      showMask
    />
  );
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
};

const TextMaskCvc = (props) => {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={ref => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[/[0-9]/, /\d/, /\d/, /\d/]}
      placeholderChar={'\u2000'}
      showMask
    />
  );
}

TextMaskCvc.propTypes = {
  inputRef: PropTypes.func.isRequired,
};

const NumberFormatCustom = (props) => {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      ref={ref => {
        inputRef(ref ? ref.inputElement : null);
      }}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      thousandSeparator
      prefix="$"
    />
  );
};

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};


const renderInput = (inputProps) => {
  const { classes, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: ref,
        ...other,
      }}
    />
  );
}

@inject('store')
@observer
class Payment  extends Component {
  @observable focused;
  @observable amount = '0.00';
  @observable tab = 'credit';

  handleCallback(type, isValid) {
    console.log(type, isValid); //eslint-disable-line no-console
  }

  handleTextChange = (name, check) => event => {
    const { store } = this.props;
    if (check) {
      store.check[name] = event.target.value;
    } else {
      store.creditCard[name] = event.target.value;
    }
  }

  handleUpdateAmount = event => {
    this.amount = event.target.value;
  }

  handleInputFocus = ({ target }) => {
    this.focused = target.id;
    if (target.id === 'amount') {
      target.select();
    }
  }

  handleTabChange = (event, value) => {
    this.tab = value;
  }

  paymentDisabled = () => {
    const { store } = this.props;
    let disabled = false;
    /**
    if (this.tab === 'check') {
      disabled = (store.check.number.length < 1 || this.amount === "0.00") ? true : disabled;
    } else {
      disabled = (!store.isCardValid() || this.amount === "0.00") ? true : disabled;
    }
    */

    return disabled;
  }

  render() {
    const { classes, store } = this.props;
    const { registrant, updateRegistrant } = store;

    const goBack = () => navigate('/dashboard');
    const cancel = () => {
      store.clearCreditCard();
      goBack();
    }
    const save = async () => {
      let result;
      result = await store.makePayment(this.tab, this.amount, null);
      if (result.data) {
        store.filters.replace([{
          columnName: 'displayId',
          value: result.data.registrantId,
        }]);
        navigate('/dashboard');
      }
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
              <Typography variant="h5">
                Payment
              </Typography>
            </CardContent>
            <Divider />
            <CardContent>
              <Paper>
                <Tabs value={this.tab} onChange={this.handleTabChange}>
                  <Tab value={'credit'} label="Credit Card" />
                  <Tab value={'check'} label="Check" />
                </Tabs>
              </Paper>
              <div className={classes.tab}>
                {this.tab === 'credit' && registrant ?
                  <Grid container spacing={24}>
                    <Grid item xs={12} md={12}>
                      <CreditCardInput
                        cardNumberInputProps={{ value: store.creditCard.cardNumber, onChange: this.handleTextChange('cardNumber', false) }}
                        cardExpiryInputProps={{ value: store.creditCard.expirationDate, onChange: this.handleTextChange('expirationDate', false) }}
                        cardCVCInputProps={{ value: store.creditCard.security, onChange: this.handleTextChange('security', false) }}
                        fieldClassName="input"
                      />
                    </Grid>

                  </Grid>
                  :
                  <Grid container spacing={24}>
                    <Grid item xs={12} md={12}>
                      <div className={classes.container}>
                        <TextField
                          label="Check Number"
                          id="number"
                          className={classes.formControl}
                          value={store.check.number}
                          onChange={this.handleTextChange('number', true)}
                          onFocus={this.handleInputFocus}
                          margin="normal"
                          fullWidth
                        />
                      </div>
                    </Grid>
                  </Grid>
                }
              </div>
              <TextField
                className={classes.formControl}
                label="Amount"
                value={this.amount}
                onChange={this.handleUpdateAmount}
                onFocus={this.handleInputFocus}
                id="amount"
                InputProps={{
                  inputComponent: NumberFormatCustom,
                }}
                fullWidth
              />
            </CardContent>
            <Divider />
            <CardActions>
              <Button
                disabled={this.paymentDisabled()}
                onClick={save}
                color="primary">
                Make Payment
              </Button>
              <Button
                onClick={cancel}
                color="secondary"
              >
                Cancel
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

Payment.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Payment);
