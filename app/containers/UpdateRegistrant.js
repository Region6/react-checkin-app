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
import InputLabel  from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import MaskedInput from 'react-text-mask';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Paper from '@material-ui/core/Paper';

import { navigate } from '../components/routerHistory';
import AutoSuggest from '../components/AutoSuggest';

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
  fullWidth: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
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
});

const TextMaskCustom = (props) => {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={ref => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
      placeholderChar={'\u2000'}
      showMask
    />
  );
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
};

const renderInput = (inputProps) => {
  const { classes, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        shrink: true,
        inputRef: ref,
        ...other,
      }}
    />
  );
}

const renderUserId = (suggestion, { query, isHighlighted }) => {
  // const matches = match(`${suggestion.company} - ${suggestion.street1} ${suggestion.city}, ${suggestion.state}`, query);
  // const parts = parse(`${suggestion.company} - ${suggestion.street1} ${suggestion.city}, ${suggestion.state}`, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      [{suggestion.id}] {suggestion.organization} - {suggestion.street}&nbsp;{suggestion.city}, {suggestion.state}
    </MenuItem>
  );
}

const renderSuggestion = (suggestion, { query, isHighlighted }) => {
  // const matches = match(`${suggestion.company} - ${suggestion.street1} ${suggestion.city}, ${suggestion.state}`, query);
  // const parts = parse(`${suggestion.company} - ${suggestion.street1} ${suggestion.city}, ${suggestion.state}`, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      [{suggestion.siteId}] {suggestion.company} - {suggestion.street1}&nbsp;{suggestion.city}, {suggestion.state}
    </MenuItem>
  );
}

const renderSuggestionsContainer = (options) => {
  const { containerProps, children } = options;

  return (
    <Paper {...containerProps} square>
      {children}
    </Paper>
  );
};

@inject('store')
@observer
class UpdateRegistrant  extends Component {
  getSuggestions = (inputValue) => {
    const { store } = this.props;
    console.log('getSuggestions', inputValue);
    if (typeof inputValue === 'object') {
      store.registrant.siteId = inputValue.siteId;
    } else {
      store.siteIdQuery = inputValue;
    }
  }

  handleSuggestionsFetchRequested = ({ value }) => {
    console.log('handleSuggestionsFetchRequested', value);
    this.getSuggestions(value);
  }

  handleSuggestionsClearRequested = () => {
    const { store } = this.props;
    store.siteIdsFiltered.clear();
  }

  handleSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    const { store } = this.props;
    store.registrant.siteId = suggestion.siteId;
    store.registrant.address = suggestion.street1;
    store.registrant.address2 = suggestion.street2;
    store.registrant.city = suggestion.city;
    store.registrant.organization = suggestion.company;
    const state = store.getCountryState('US', suggestion.state);
    store.registrant.state = (state) ? state.name : '';
    store.registrant.zip = suggestion.zipCode;
  }

  getUserId = (inputValue) => {
    const { store } = this.props;
    if (typeof inputValue === 'object') {
      store.registrant.userId = inputValue.id;
    } else {
      store.userIdQuery = inputValue;
    }
  }

  handleUserIdFetchRequested = ({ value }) => {
    console.log('handleUserIdFetchRequested', value);
    this.getUserId(value);
  }

  handleUserIdClearRequested = () => {
    const { store } = this.props;
    store.userIdsFiltered.clear();
  }

  handleUserIdSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    const { store } = this.props;
    store.registrant.userId = suggestion.id;
    store.registrant.address = suggestion.address;
    store.registrant.address2 = suggestion.address2;
    store.registrant.city = suggestion.city;
    store.registrant.organization = suggestion.organization;
    const state = store.getCountryState('US', suggestion.state);
    store.registrant.state = (state) ? state.name : '';
    store.registrant.zip = suggestion.zip;
  }

  render() {
    const { classes, store } = this.props;
    const { registrant, updateRegistrant } = store;

    const goBack = () => navigate('/dashboard');
    const save = async () => {
      let result;
      if (registrant.id) {
        result = await store.saveRegistrant(registrant);
      } else {
        result = await store.saveNewRegistrant();
        if (result.data) {
          store.updateFilters([{
            columnName: 'displayId',
            value: result.data.registrantId,
          }]);
          store.filterRegistrants();
          navigate('/dashboard');
        }
      }
    }
    const handleChange = (event) => {
      store.updateNoConflict(event.target.checked);
    };
    const selectType = (type) => (event) => {
      updateRegistrant(type, event.target.checked);
    };

    const handleTextChange = name => event => {
      updateRegistrant(name, event.target.value);
    };

    const handleSelectChange = name => event => {
      updateRegistrant(name, event.target.value);
    };

    const handleSiteIdChange = (event, { newValue, method }) => {
      console.log('handleSiteIdChange', newValue);
      //updateRegistrant('siteId', newValue);
      store.siteIdQuery = newValue;
    };

    const handleUserIdChange = (data, event) => {
      console.log('handleSiteIdChange', data);
      if (!data) {
        store.registrant.userId = '';
        store.registrant.address = '';
        store.registrant.address2 = '';
        store.registrant.city = '';
        store.registrant.state = '';
        store.registrant.zip = '';
        store.registrant.organization = '';
        store.registrant.siteId = '';
      } else if (data.type === 'exhibitor') {
        store.registrant.userId = data.info.id;
        store.registrant.address = data.info.address;
        store.registrant.address2 = data.info.address2;
        store.registrant.city = data.info.city;
        store.registrant.organization = data.info.organization;
        const state = store.getCountryState('US', data.info.state);
        store.registrant.state = (state) ? state.name : '';
        store.registrant.zip = data.info.zip;
      } else {
        store.registrant.siteId = data.info.siteId;
        store.registrant.address = data.info.street1;
        store.registrant.address2 = data.info.street2;
        store.registrant.organization = data.info.company;
        store.registrant.city = data.info.city;
        const state = store.getCountryState('US', data.info.state);
        store.registrant.state = (state) ? state.name : '';
        store.registrant.zip = data.info.zipCode;
      }
    };

    const clearSiteId = () => {
      registrant.siteId = '';
    };

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
                Update Registrant
              </Typography>
            </CardContent>
            <Divider />
            <CardContent>
              {registrant ?
                <div className={classes.container}>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={registrant.exhibitor ? true : false}
                          onChange={selectType('exhibitor')}
                          value="exhibitor"
                        />
                      }
                      label="Exhibitor"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={registrant.speaker ? true : false}
                          onChange={selectType('speaker')}
                          value="speaker"
                        />
                      }
                      label="Speaker"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={registrant.osha ? true : false}
                          onChange={selectType('osha')}
                          value="osha"
                        />
                      }
                      label="OSHA"
                    />
                  </FormGroup>
                  {registrant.exhibitor ?
                    <FormControl fullWidth className={classes.fullWidth}>
                      <AutoSuggest
                        async
                        value={store.getUserIdCompanyName(registrant.userId)}
                        asyncOptions={store.getExhibitorOptions}
                        placeholder='Search for an Exhibitor'
                        onChange={handleUserIdChange}
                      />
                    </FormControl>
                    : null
                  }
                  <TextField
                    id="name"
                    label="First Name"
                    className={classes.formControl}
                    value={registrant.firstname ? registrant.firstname : ''}
                    onChange={handleTextChange('firstname')}
                    margin="normal"
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    className={classes.formControl}
                    value={registrant.lastname ? registrant.lastname : ''}
                    onChange={handleTextChange('lastname')}
                    margin="normal"
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    className={classes.formControl}
                    value={registrant.email ? registrant.email : ''}
                    onChange={handleTextChange('email')}
                    margin="normal"
                    fullWidth
                  />
                  <TextField
                    className={classes.formControl}
                    id="phone"
                    label="Phone"
                    value={registrant.phone ? registrant.phone : ''}
                    onChange={handleTextChange('phone')}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      inputComponent: TextMaskCustom,
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Job Title"
                    className={classes.formControl}
                    value={registrant.title ? registrant.title : ''}
                    onChange={handleTextChange('title')}
                    margin="normal"
                    fullWidth
                  />
                  <TextField
                    label="Company"
                    className={classes.formControl}
                    value={registrant.organization ? registrant.organization : ''}
                    onChange={handleTextChange('organization')}
                    margin="normal"
                    fullWidth
                  />
                  <FormControl fullWidth className={classes.fullWidth}>
                    <AutoSuggest
                      async
                      value={store.getSiteIdCompanyName(registrant.siteId)}
                      asyncOptions={store.getSiteIdOptions}
                      placeholder='Search for a Site Id'
                      onChange={handleUserIdChange}
                    />
                  </FormControl>
                  <TextField
                    label="Street Address 1"
                    className={classes.formControl}
                    value={registrant.address ? registrant.address : ''}
                    onChange={handleTextChange('address')}
                    margin="normal"
                    fullWidth
                  />
                  <TextField
                    label="Street Address 2"
                    className={classes.formControl}
                    value={registrant.address2 ? registrant.address2 : ''}
                    onChange={handleTextChange('address2')}
                    margin="normal"
                    fullWidth
                  />
                  <FormControl>
                    <TextField
                      label="City"
                      className={classes.textField}
                      value={registrant.city ? registrant.city : ''}
                      onChange={handleTextChange('city')}
                      margin="normal"
                      fullWidth
                    />
                  </FormControl>
                  <FormControl
                    className={classes.selectFormControl}
                  >
                    <Select
                      value={registrant.state ? registrant.state : ''}
                      displayEmpty
                      onChange={handleSelectChange('state')}
                    >
                      <MenuItem value="">
                        Select State
                      </MenuItem>
                      {store.getCountryStates('US').map(state => (
                        <MenuItem key={state.name} value={state.name}>{state.name}</MenuItem>
                      ))}
                      {store.getCountryStates('CA').map(state => (
                        <MenuItem key={state.name} value={state.name}>{state.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <TextField
                      label="Zip/Postal Code"
                      className={classes.textField}
                      value={registrant.zip ? registrant.zip : ''}
                      onChange={handleTextChange('zip')}
                      margin="normal"
                      fullWidth
                    />
                  </FormControl>
                  <TextField
                    label="Group #"
                    className={classes.formControl}
                    value={registrant.groupConfirm ? registrant.groupConfirm : ''}
                    onChange={handleTextChange('groupConfirm')}
                    margin="normal"
                    fullWidth
                  />
                </div> : null
              }
            </CardContent>
            <Divider />
            <CardActions>
              <Button
                onClick={save}
                color="primary">
                Save
              </Button>
              <Button
                onClick={goBack}
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

UpdateRegistrant.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UpdateRegistrant);
