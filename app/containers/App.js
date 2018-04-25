import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import CssBaseline from 'material-ui/CssBaseline';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import Input, { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Select from 'material-ui/Select';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Snackbar from 'material-ui/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import Drawer from 'material-ui/Drawer';
import AddIcon from '@material-ui/icons/Add';
import Divider from 'material-ui/Divider';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { withRouter } from 'react-router';

import SettingsDialog from '../components/SettingsDialog';

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
    zIndex: 100,

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
  footer: {
    position: 'fixed',
    bottom: '0px',
    height: 25,
    padding: '2px 10px',
    color: theme.palette.primary.contrastText,
    width: '100%',
    backgroundColor: theme.palette.primary.main,
    textAlign: 'left',
  }
});

@inject('store')
@observer
class App extends Component {
  @observable radioGroup;

  openDrawer = () => {
    const { store } = this.props;
    store.openDrawer(true);
  }

  toggleDrawer = (open) => {
    const { store } = this.props;
    store.openDrawer(open);
  }

  addRegistrant = () => {
    const { store, history } = this.props;
    history.push('/registrant/add');
  }

  clickProgram = (id, e) => {
    const { history } = this.props;
    history.push(`/a/program/${id}`);
  }

  handleSnackBarClose = () => {
    const { store } = this.props;
    store.snackBar.open = false;
  }

  render() {
    const { classes, store, route } = this.props;
    const { user } = store;
    const openSettings = () => {
      store.dialogs.settings = true;
    };
    const handleClose = () => {
      store.dialogs.settings = false;
    };
    
    return (
      <div className={classes.root}>
        <CssBaseline />
        <Drawer
          open={store.drawerOpen}
          onClose={() => this.toggleDrawer(false)}
        >
          <div
            className={classes.list}
            tabIndex={0}
            role="button"
            onClick={() => this.toggleDrawer(false)}
            onKeyDown={() => this.toggleDrawer(false)}
          >
            <List>
              <ListItem button>
                <ListItemText
                  primary="Add Registrant"
                  onClick={this.addRegistrant}
                />
              </ListItem>
            </List>
            <Divider />
          </div>
        </Drawer>
        <AppBar position="sticky" className={classes.appBar}>
          <Toolbar>
            <IconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
              onClick={() => this.toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" className={classes.flex}>
              Check In
            </Typography>
            <IconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Settings"
              onClick={openSettings}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <main className={classes.content}>
          {this.props.children}
          {store.path === '/dashboard' || store.path === '/' ?
            <Button

              variant="fab"
              color="secondary"
              aria-label="add"
              className={classes.fab}
              onClick={this.addRegistrant}
            >
              <AddIcon />
            </Button>
            :
            null
          }
          <Snackbar
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={store.snackBar.open}
            autoHideDuration={6000}
            onClose={this.handleSnackBarClose}
            SnackbarContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{store.snackBar.message}</span>}
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                className={classes.close}
                onClick={this.handleSnackBarClose}
              >
                <CloseIcon />
              </IconButton>,
            ]}
          />
        </main>
        <div className={classes.footer}>
          <Typography variant="body1" color="inherit">
            {store.stats.checkedIn} / {store.stats.totalRegistrants}
          </Typography>
        </div>
        <SettingsDialog />
      </div>
    );
  }
};


App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(App));
