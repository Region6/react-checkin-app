import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observable, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText, FormControlLabel, FormGroup } from 'material-ui/Form';
import Button from 'material-ui/Button';
import ButtonBase from 'material-ui/ButtonBase';
import TextField from 'material-ui/TextField';
import Switch from 'material-ui/Switch';
import MaskedInput from 'react-text-mask';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Paper from 'material-ui/Paper';

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
});

const TextMaskCustom = (props) => {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={inputRef}
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
        inputRef: ref,
        ...other,
      }}
    />
  );
}

const renderSuggestion = (suggestion, { query, isHighlighted }) => {
  // const matches = match(`${suggestion.company} - ${suggestion.street1} ${suggestion.city}, ${suggestion.state}`, query);
  // const parts = parse(`${suggestion.company} - ${suggestion.street1} ${suggestion.city}, ${suggestion.state}`, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      {suggestion.company} - {suggestion.street1} {suggestion.city}, {suggestion.state}
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
  componentDidMount() {
    const { classes, store, match, history } = this.props;
    console.log(match);
    if (match.params.id) {
      store.setRegistrant(match.params.id);
    }
    console.log(store.browserHistory);
  }

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
  }

  render() {
    const { classes, store, match, history } = this.props;
    const { registrant, updateRegistrant } = store;

    const goBack = () => history.push('/dashboard');
    const save = async () => {
      let result;
      if (registrant.id) {
        result = await store.saveRegistrant(registrant);
      } else {
        result = await store.saveNewRegistrant();
        if (result.data) {
          store.filters.replace([{
            columnName: 'displayId',
            value: result.data.registrantId,
          }]);
          history.push('/dashboard');
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
                          checked={registrant.speaker ? true : false}
                          onChange={selectType('osha')}
                          value="osha"
                        />
                      }
                      label="OSHA"
                    />
                  </FormGroup>
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
                  <Autosuggest
                    theme={{
                      container: classes.suggestionsContainer,
                      suggestionsContainerOpen: classes.suggestionsContainerOpen,
                      suggestionsList: classes.suggestionsList,
                      suggestion: classes.suggestion,
                    }}
                    renderInputComponent={renderInput}
                    suggestions={toJS(store.siteIdsFiltered)}
                    onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
                    onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
                    onSuggestionSelected={this.handleSuggestionSelected}
                    renderSuggestionsContainer={renderSuggestionsContainer}
                    getSuggestionValue={this.getSuggestions}
                    renderSuggestion={renderSuggestion}
                    inputProps={{
                      classes,
                      placeholder: 'Search for a Site Id',
                      value: store.getSiteIdCompanyName(registrant.siteId),
                      onChange: handleSiteIdChange,
                    }}
                  />
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
