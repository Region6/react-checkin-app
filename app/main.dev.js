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
import { setup as setupPushReceiver } from 'electron-push-receiver';

import MenuBuilder from './menu';
let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
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
    .catch(console.log);
};

const print = (mimeType, src, printer) => {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      webSecurity: false,
    }
  });
  win.loadURL(`data:text/html;charset=utf-8,${encodeURI(src)}`);
 // if pdf is loaded start printing.
  win.webContents.on('did-finish-load', () => {
    /*
    win.show();
    win.focus();
    win.openDevTools();
    */

    win.webContents.print({
      silent: true,
      deviceName: printer,
      printBackground: true,
    });
    win = null;
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
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      nativeWindowOpen: true,
      plugins: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);
  setupPushReceiver(mainWindow.webContents);

  ipcMain.on('getPrinters', (event, arg) => {
    console.log('Get Printers');
    const printers = mainWindow.webContents.getPrinters();
    event.sender.send('gotPrinters', printers);
  });

  ipcMain.on('print', (event, arg) => {
    console.log('Printing...');
    print(arg.mimeType, arg.src, arg.printer);
  });

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
    mainWindow.openDevTools();
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
        // open window as modal
        event.preventDefault();
        const opts = Object.assign(
          {},
          options,
          {
            modal: true,
            parent: mainWindow,
            width: 850,
            height: 500,
            webPreferences: {
              plugins: true,
            },
          },
        );
        event.newGuest = new BrowserWindow(opts);
        event.newGuest.openDevTools();
      }
    }
  );
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
