import React from 'react';
import PropTypes from 'prop-types';
import { observable, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Divider from 'material-ui/Divider';
import Input, { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Select from 'material-ui/Select';
import TextField from 'material-ui/TextField';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { withRouter } from 'react-router';
import { withStyles } from 'material-ui/styles';

const drawerWidth = 240;
const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  dialog: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
  toolbar: theme.mixins.toolbar,
  list: {
    width: drawerWidth - 20,
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  card: {
    marginBottom: 10,
  },
  button: {
    margin: theme.spacing.unit,
  },
  fab: {
    margin: 0,
    top: 'auto',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
    position: 'fixed',

  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  selectFormControl: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 4,
    minWidth: 320,
  },
});

const SettingsDialog = inject('store')(observer(({ classes, store, history }) => {
  const getSelectedPrinter = (type) => {
    let retVal = "";
    const selected = store.getSelectedPrinter(type);
    if (selected) {
      retVal = selected.printer.name;
    }
    return retVal;
  };

  const handlePrinterChange = type => event => {
    if (event.target.value.length) {
      const printer = store.updateSelectedPrinter(type, event.target.value);
    }
    // return printer;
  };

  const handleDeviceChange = type => event => {
    if (event.target.value.length) {
      const device = store.updateSelectedDevice(type, event.target.value);
    }
    // return printer;
  };

  const getSelectedDevice = (type) => {
    let retVal = "";
    const selected = store.getSelectedDevice(type);
    if (selected && selected.device) {
      retVal = selected.device.comName;
    }
    return retVal;
  };
  const openSettings = () => {
    store.dialogs.settings = true;
  };
  const handleClose = () => {
    store.dialogs.settings = false;
  };

  const handleSettingsChange = type => event => {
    const setting = store.settings[type] = event.target.value;
    // return printer;
  };

  return (
    <Dialog
      open={store.dialogs.settings}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Settings</DialogTitle>
      <DialogContent className={classes.dialog}>
        <FormControl className={classes.selectFormControl}>
          <InputLabel htmlFor="badge-printer">Badge Printer</InputLabel>
          <Select
            autoWidth
            value={getSelectedPrinter('badge')}
            onChange={handlePrinterChange('badge')}
            inputProps={{
              id: 'badge-printer',
            }}
          >
            <MenuItem value="">
              Select a printer...
            </MenuItem>
            {store.printers.map(printer => (
              <MenuItem key={printer.name} value={printer.name}>{printer.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.selectFormControl}>
          <InputLabel htmlFor="receipt-printer">Receipt Printer</InputLabel>
          <Select
            autoWidth
            value={getSelectedPrinter('receipt')}
            onChange={handlePrinterChange('receipt')}
            inputProps={{
              id: 'receipt-printer',
            }}
          >
            <MenuItem value="">
              Select a printer...
            </MenuItem>
            {store.printers.map(printer => (
              <MenuItem key={printer.name} value={printer.name}>{printer.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.selectFormControl}>
          <InputLabel htmlFor="scanner">Scanner</InputLabel>
          <Select
            autoWidth
            value={getSelectedDevice('scanner')}
            onChange={handleDeviceChange('scanner')}
            inputProps={{
              id: 'scanner',
            }}
          >
            <MenuItem value="">
              Select a device...
            </MenuItem>
            {store.ports.map(port => (
              <MenuItem key={port.comName} value={port.comName}>{port.pnpId}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="API URL"
            className={classes.textField}
            value={store.settings.apiUrl ? store.settings.apiUrl : ''}
            onChange={handleSettingsChange('apiUrl')}
            margin="normal"
            fullWidth
          />
        </FormControl>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="Auth Token"
            className={classes.textField}
            value={store.settings.token ? store.settings.token : ''}
            onChange={handleSettingsChange('token')}
            margin="normal"
            fullWidth
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}));

SettingsDialog.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(SettingsDialog));