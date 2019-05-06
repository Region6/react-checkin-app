/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import { autoUpdater } from "electron-updater";
const log = require('electron-log');
log.transports.file.level = "debug";
autoUpdater.logger = log;
log.info('App starting...');

// import MenuBuilder from './menu';

const debug = require('electron-debug');
debug();

let mainWindow = null;

const sendStatusToWindow = (text) => {
  log.info(text);
  mainWindow.webContents.send('message', text);
};

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(log.info);
};

const print = (src, printer, cb) => {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      webSecurity: false,
    }
  });
  win.loadURL(`data:text/html;charset=utf-8,${src}`);
 // if pdf is loaded start printing.
  win.webContents.on('did-finish-load', () => {

    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      win.show();
      win.focus();
      win.openDevTools();
    }

    log.info('sending to printer', printer);
    setTimeout(
      () => {
        win.webContents.print(
          {
            silent: true,
            deviceName: printer,
            printBackground: true,
          },
          (success) => {
            log.info('Print job was', success);
            cb(success);
            //win = null;
          },
        );
      },
      500
    );
    // close window after print order.
  });
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  } else {
    //autoUpdater.checkForUpdates();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    backgroundColor: '#3f51b5',
    webPreferences: {
      nativeWindowOpen: true,
      plugins: true,
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);
  autoUpdater.checkForUpdatesAndNotify();

  ipcMain.on('getPrinters', (event, arg) => {
    log.info('Get Printers');
    const printers = mainWindow.webContents.getPrinters();
    event.sender.send('gotPrinters', printers);
  });

  ipcMain.on('print', (event, arg) => {
    log.info('Printing...');
    const cb = (success) => {
      if (success) {
        event.sender.send('snackbar:close');
      }
    };
    print(arg.src, arg.printer, cb);
  });

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      mainWindow.openDevTools();
    }

  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('before-quit', () => {
    mainWindow.webContents.send('quit', {quit: true})
  });


  mainWindow.webContents.on(
    'new-window',
    (event, url, frameName, disposition, options, additionalFeatures) => {
      if (frameName === 'view') {
        // open window
        event.preventDefault();
        const opts = Object.assign(
          {},
          options,
          {
            parent: mainWindow,
            width: 850,
            height: 500,
            webPreferences: {
              plugins: true,
              nodeIntegration: false,
            },
          },
        );
        event.newGuest = new BrowserWindow(opts);
        // event.newGuest.openDevTools();
      }
    }
  );
  //const menuBuilder = new MenuBuilder(mainWindow);
  //menuBuilder.buildMenu();
  mainWindow.setMenu(null);
});

// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
});
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
});
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});

// when receiving a quitAndInstall signal, quit and install the new version ;)
ipcMain.on("quitAndInstall", (event, arg) => {
  autoUpdater.quitAndInstall();
});
