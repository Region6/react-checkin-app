import { remote } from 'electron';
import path from 'path';
import { observable, autorun, action, computed, toJS } from 'mobx';
import { createViewModel } from 'mobx-utils';
import axios from 'axios';
import readFile from 'fs-readfile-promise';
import arraySort from 'arr-sort';
import { ipcRenderer } from 'electron';
import SerialPort from 'serialport';
import HID from 'node-hid';
import usbDetect from 'usb-detection';
import Swipe from 'card-swipe';
import valid from 'card-validator';
import provinces from 'provinces';
import compile from 'template-literal';
import storage from 'electron-json-storage';
import Fuse from 'fuse.js';
import Handlebars from 'handlebars';
import HandlebarsIntl from 'handlebars-intl';
import { map, props, mapSeries } from 'awaity';
import PDF417 from 'pdf417';
import io from 'socket.io-client';

import receiptTemplate from '../assets/receipt.html';
import badgeTemplate from '../assets/badge.html';
import dlParser from '../lib/dlParser';
import Database from './Database';
import config from '../../config';

HandlebarsIntl.registerWith(Handlebars);
Handlebars.registerHelper ('truncate', function (str, len) {
  if (str && str.length > len) {
    let new_str = str.substr (0, len+1);

    while (new_str.length) {
      let ch = new_str.substr ( -1 );
      new_str = new_str.substr ( 0, -1 );

      if (ch == ' ') {
          break;
      }
    }

    if (new_str == '') {
      new_str = str.substr (0, len);
    }

    return new Handlebars.SafeString (new_str +'...');
  }
  return str;
});
Handlebars.registerHelper({
  eq: function (v1, v2) {
      return v1 === v2;
  },
  ne: function (v1, v2) {
      return v1 !== v2;
  },
  lt: function (v1, v2) {
      return v1 < v2;
  },
  gt: function (v1, v2) {
      return v1 > v2;
  },
  lte: function (v1, v2) {
      return v1 <= v2;
  },
  gte: function (v1, v2) {
      return v1 >= v2;
  },
  and: function () {
      return Array.prototype.slice.call(arguments).every(Boolean);
  },
  or: function () {
      return Array.prototype.slice.call(arguments).some(Boolean);
  }
});


const app = remote.app;
const rootFolder = process.env.NODE_ENV === 'development'
  ? `${process.cwd()}/app`
  : `${path.resolve(app.getAppPath(), '../../')}/resources/app.asar`;
const Readline = SerialPort.parsers.Readline;
const fields = [
  "firstname",
  "lastname",
  "title",
  "email",
  "phone",
  "organization",
  "address",
  "address2",
  "city",
  "state",
  "zip",
  "attend",
  "exhibitor",
  "siteId",
  "dietary",
  "management",
  "speaker",
  "osha",
  "groupConfirm",
  "confirmation",
];

const isAlphaNumeric = ch => {
	return ch.match(/^[a-z0-9]+$/i) !== null;
}

const titleCase = (str) => {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
};

export default class Store {
  @observable drawerOpen = false;
  @observable user = {};
  @observable db = new Database();
  @observable registrant = null;
  @observable printers = [];
  @observable settings = {
    selectedPrinters: [],
    selectedDevices: [],
    apiUrl: '',
    token: '',
  };
  @observable paging = {
    page: 0,
    limit: 50,
  };
  @observable count = {
    exhibitors: 0,
    general: 0,
  };
  @observable searchValue = {
    column: '',
    value: '',
  };
  @observable ports = [];
  @observable filters = [];
  @observable sorting = [];
  @observable expandedRows = [];
  @observable events = [];
  @observable templates = [];
  @observable siteIds = [];
  @observable userIds = [];
  @observable siteIdsFiltered = [];
  @observable userIdsFiltered = [];
  @observable loading = false;
  @observable siteIdQuery = '';
  @observable userIdQuery = '';
  @observable scannerData = [];
  @observable creditCard = {
    cardNumber: '',
    name: '',
    expirationDate: '',
    security: '',
    trackOne: null,
    trackTwo: null,
  };
  @observable check = {
    number: '',
  };
  @observable swipe;
  @observable path = '/dashboard';
  @observable dialogs = {
    settings: false,
    profile: false,
  };
  @observable page = {
    current: 0,
    size: 5,
    sizes: [5, 10, 15, 20, 25, 50, 75, 100],
  };
  @observable snackBar = {
    open: false,
    message: '',
  };
  @observable vendorIds = [
    "05e0",
  ];
  @observable stats = {
    totalRegistrants: 800,
    checkedIn: 147,
  };
  cardScanner = new Swipe.Scanner();
  serialport;
  request;
  logRocket;
  scanner;
  parser;
  browserHistory;
  socket;

  constructor() {
    const self = this;
    storage.setDataPath();
    usbDetect.startMonitoring();
    console.log('datapath', storage.getDataPath(), storage.getAll());

    const swipe = new Swipe({
      scanner: this.cardScanner,
      onScan: (data) => {
        console.log('swipe', data);
        const card = {
          name: (data.name) ? data.name : '',
          cardNumber: (data.account) ? data.account : '',
          expirationDate: (data.exp_month && data.exp_year) ? `${data.exp_month}/${data.exp_year}` : '',
          security: '',
          trackOne: (data.track_one) ? data.track_one : null,
          trackTwo: (data.track_two) ? data.track_two : null,
        };
        self.creditCard = Object.assign(
          {},
          self.creditCard,
          card,
        );
      }
    });

    /*
    const disposer = autorun(
      () => {
        console.log(this.filters);
        if (this.filters.length > 0) {
          this.filterRegistrants();
        }
      },
      { delay: 900 }
    );
    */

    const disposerSorting = autorun(
      () => {
        console.log(this.sorting);
        if (this.sorting.length > 0) {
          this.filterRegistrants();
        }
      },
      { delay: 10 }
    );

    const disposerSettings = autorun(
      () => {
        console.log('settings:', this.settings);
        storage.set('settings', toJS(this.settings), (error) => {
          if (error) throw error;
        });
      },
      { delay: 900 }
    );

    const disposerSettingsToken = autorun(
      () => {
        console.log('settings:', this.settings.token);
        this.setupRequest();
        this.setupWS();
      },
      { delay: 900 }
    );

    const disposerSettingsUrl = autorun(
      () => {
        console.log('settings:', this.settings.apiUrl);
        this.setupRequest();
        this.setupWS();
      },
      { delay: 900 }
    );

    const disposerSiteIds = autorun(
      () => {
        console.log(this.siteIdQuery);
        if (this.siteIdQuery && this.siteIdQuery.length > 2) {
          this.searchSiteIds(this.siteIdQuery);
        }
      },
      { delay: 900 }
    );

    const disposerUserIds = autorun(
      () => {
        console.log(this.userIdQuery);
        if (this.userIdQuery && this.userIdQuery.length > 2) {
          this.searchUserIds(this.userIdQuery);
        }
      },
      { delay: 900 }
    );

    const disposerScannerData = autorun(
      () => {
        console.log(this.scannerData);
        if (this.scannerData && this.scannerData.length) {
          const barcode = this.scannerData.join('');
          this.parseScannerData(barcode);
        }
      },
      { delay: 900 }
    );

  }

  setup = async () => {
    const self = this;
    ipcRenderer.on(
      'gotPrinters',
      (event, arg) => {
        self.printers = arg;
        console.log(self.printers);
      }
    );
    ipcRenderer.on(
      'quit',
      (event, arg) => {
        this.swipe.close();
        usbDetect.stopMonitoring();
      }
    );
    ipcRenderer.on(
      'snackbar:closes',
      (event, arg) => {
        self.snackBar.open = false;
      }
    );
    ipcRenderer.send('getPrinters');
    await this.getSettings();
    this.setupRequest();
    this.setupWS();
    await this.setupTemplates();
    await this.getSerialDevices();
    this.setupDevices();
    try {
      await this.getRegistrants();
      await this.getEvents();
      await this.getSiteIds();
      await this.getUserIds();
      await this.getStats();
      this.setupMagSwipe();
      usbDetect.on(
        'add',
        (device) => {
          console.log('add', device);
          setTimeout(() => {
            self.setupMagSwipe();
          }, 2000);
        }
      );
      usbDetect.on(
        'remove',
        (device) => {
          console.log('remove', device);
          self.swipe.close();
        }
      );
    } catch(e) {
      console.log(e);
    }
    return true;
  }

  setupLogRocket = (logRocket) => {
    this.logRocket = logRocket;
    /*
    this.logRocket.identify(
      this.user.new_id,
      {
        name: `${this.user.lastname}, ${this.user.firstname}`,
        email: this.user.email,
      }
    );
    */
  }

  getSerialDevices = async () => {
    this.ports = await SerialPort.list();
    console.log(this.ports);
  }

  setupDevices = () => {
    if (this.settings && this.settings.selectedDevices) {
      const scanner = this.settings.selectedDevices.find(d => d.type === 'scanner');
      if (scanner && scanner.device) {
        this.setupScanner(scanner.device);
      }
    }

    return true;
  }

  setupMagSwipe = () => {
    const self = this;
    try {
      const devices = HID.devices();
      console.log(devices);
      const swipe = devices.find(d => d.vendorId === 2049 && d.productId === 2);
      if (swipe) {
        this.swipe = new HID.HID(swipe.path);
        this.swipe.on("data", (data) => {
          try {
            self.cardScanner.input(data.toString());
          } catch (e) {
            console.log(e);
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  setupRequest = () => {
    const baseURL = (this.settings.apiUrl) ? `${this.settings.apiUrl }/api` : `${config.apiUrl}/api`;
    const token = (this.settings.token) ? this.settings.token : '';
    this.request = axios.create({
      baseURL,
      timeout: 45000,
      headers: {"Authorization" : `Bearer ${token}`}
    });
  }

  setupWS = () => {
    const url = (this.settings.apiUrl) ? this.settings.apiUrl: config.apiUrl;
    if (!this.socket) {
      this.socket = io.connect(url);
      this.socket.on('connect', () => {
        console.log('socket connected');
      });
      this.socket.on('count', (data) => {
        console.log(data);
        this.stats = data;
      });
    }
  }

  setupScanner = (scanner) => {
    const self = this;
    try {
      this.scanner = new SerialPort(
        scanner.comName
      );
      const parser = new Readline({
        delimiter: '\r',
      });
      parser.on('data', (data) => {
        console.log('Readline', data);
      });
      this.scanner.on('data', (data) => {
        console.log('Data:', data.toString('utf8'));
        self.scannerData.push(data.toString('utf8'));
      });

    } catch (e) {
      console.log(e);
      this.scanner = null;
    }
  }

  getSettings = () => {
    const self = this;
    return new Promise(
      resolve => {
        storage.get(
          'settings',
          (error, data) => {
            if (error) throw error;
            console.log(data);
            self.settings = Object.assign(
              {},
              self.settings,
              data,
            );
            /*
            if (!data.apiUrl) {
              self.settings = {
                selectedDevices: [],
                selectedPrinters: [],
                apiUrl: config.apiUrl,
              }
            } else {
              self.settings = data;
            }
            */
            resolve(self.settings);
          }
        );
      }
    )
  }

  setupTemplates = async () => {
    this.templates.push({
      id: 'receipt',
      src: Handlebars.compile(receiptTemplate),
    });
    this.templates.push({
      id: 'badge',
      src: Handlebars.compile(badgeTemplate),
    });
  }

  parseScannerData = (data) => {
    let value;
    if (data.includes('|')) {
      const barcode = data.split('|');
      value = barcode[0];
      this.filters = [];
      this.filters.push(
        {
          columnName: 'displayId',
          value
        }
      );
    } else if (data.length < 20) {
      this.filters = [];
      this.filters.push(
        {
          columnName: 'confirmation',
          value: data.replace(/[\n\r]+/g, ''),
        }
      );
    } else {
      const barcode = dlParser(data);
      console.log(barcode);
      if (this.registrant && barcode) {
        this.registrant.firstname = titleCase(barcode.name().first);
        this.registrant.lastname = titleCase(barcode.name().last);
        this.registrant.address = titleCase(barcode.address);
        this.registrant.city = titleCase(barcode.city);
        const state = this.getCountryState('US', barcode.state);
        this.registrant.state = (state) ? state.name : '';
        this.registrant.zip = barcode.postal_code;
      }
    }
    this.scannerData.clear();
    this.filterRegistrants();
  }

  handleFcmMessage = (msg) => {
    const payload = JSON.parse(msg.payload);
    switch (msg.type) {
      case 'stats':
        this.stats = payload.count;
        break;
      default:
        console.log('unhandled data type', msg);
    }
  }

  getTemplate = (id) => {
    let retVal;
    retVal = this.templates.find(t => t.id === id);
    return retVal;
  }

  setBrowserHistory = (browserHistory) => {
    const self = this;
    this.browserHistory = browserHistory;
    this.path = this.browserHistory.location.pathname;
    this.browserHistory.listen((location, action) => {
      console.log(
        `The current URL is ${location.pathname}${location.search}${location.hash}`
      )
      console.log(`The last navigation action was ${action}`)
      self.path = location.pathname;
    });
  }

  openDrawer = (state) => {
    this.drawerOpen = state;
  }

  getCountryStates = (country) => {
    return provinces.filter(r => r.country === country);
  }

  getCountryState = (country, state) => {
    return provinces.find(r => r.country === country && r.short === state);
  }

  getSelectedPrinter = (type) => {
    const printer = this.settings.selectedPrinters.find(p => p.type === type);
    return printer;
  }

  @action updateSelectedPrinter = (type, printerName) => {
    this.settings.selectedPrinters = this.settings.selectedPrinters.filter(p => p.type !== type);
    const printer = this.printers.find(p => p.name === printerName);
    this.settings.selectedPrinters.push({
      type,
      printer
    });
    return printer;
  }

  getSelectedDevice = (type) => {
    const device = this.settings.selectedDevices.find(p => p.type === type);
    return device;
  }

  @action updateSelectedDevice = (type, comName) => {
    this.settings.selectedDevices = this.settings.selectedDevices.filter(p => p.type !== type);
    const device = this.ports.find(p => p.comName === comName);
    this.settings.selectedDevices.push({
      type,
      device
    });

    if (type === 'scanner') {
      this.setupScanner(device);
    }
    return device;
  }

  @action getStats = async () => {
    const record = await this.request.get(`/getStats`);
    if (record.data) {
      this.stats = record.data;
    }
    return this.stats;
  }

  getRegistrant = (id) => {
    const record = this.db.getRecord('registrants', id);
    return record;
  }

  @action getRegistrantFromServer = async (id) => {
    const record = await this.request.get(`/registrants/${id}`);
    if (record.data.length) {
      this.db.update('registrants', record.data[0]);
    }
    return record;
  }

  @action setRegistrant = async (id) => {
    let record = this.db.getRecord('registrants', id);
    record = createViewModel(record);
    if (!record) {
      record = await this.request.get(`/registrants/${id}`);
      record = record.data[0];
    }
    this.registrant = record;
    return record;
  }

  @action getRegistrants = async () => {
    this.loading = true;
    this.db.registrants.clear();
    const records = await this.request.get('/registrants');
    this.db.initialize('registrants', records.data);
    this.loading = false;
    return this.db.registrants;
  }

  @action updateFilters = (filters) => {
    this.filters = filters;
    if (!this.filters.length) {
      this.getRegistrants();
    }
    return this.filters;
  }

  @action updateExpandedRows = (ids) => {
    this.expandedRows = ids;
    return this.expandedRows;
  }

  @action async filterRegistrants(exhibitorsOnly) {
    this.loading = true;
    const record = {
      filters: toJS(this.filters),
      sorting: toJS(this.sorting),
      exhibitors: (exhibitorsOnly) ? 1 : 0,
      page: this.paging.page,
      limit: this.paging.limit,
    };
    const result = await this.request.post(
      `/search`,
      record,
    );
    this.db.registrants.clear();
    this.db.initialize('registrants', result.data);
    this.loading = false;
    return this.db.registrants;
  }

  @action checkInRegistrant = async (registrantId, value, parent) => {
    const record = {
      type: 'status',
      fields: {
        attend: (value) ? 1 : 0,
      },
      id: registrantId,
      registrantId,
    };
    const result = await this.request.put(
      `/registrants/${registrantId}`,
      record,
    );
    const registrant = this.db.update('registrants', result.data);
    if (parent) {
      await this.getRegistrantFromServer(parent);
    }
    this.loading = false;
    return this.db.registrants;
  }

  @action saveRegistrant = async (registrant) => {
    this.snackBar.message = 'Saving registrant...';
    this.snackBar.open = true;
    const registrantId = registrant.paddedRegId;
    const registrantFields = fields.reduce((result, key) => { result[key] = registrant[key]; return result; }, {});
    const record = {
      type: 'update',
      fields: registrantFields,
      id: registrantId,
      registrantId,
    };
    const result = await this.request.put(
      `/registrants/${registrantId}`,
      record,
    );
    this.db.update('registrants', result.data);
    this.snackBar.message = 'Registrant updated';
    this.loading = false;
    return registrant;
  }

  @action getEvents = async () => {
    const records = await this.request.get('/events/onsite');
    this.events = records.data;
    return this.events;
  }

  @action getSiteIds = async () => {
    const records = await this.request.get('/siteIds');
    this.siteIds = records.data.map(site => ({
      label: `${site.company} [${site.siteId}] - ${site.street1} ${site.city}, ${site.state}`,
      value: site.siteId,
      type: 'siteId',
      info: site,
    }));
    return this.siteIds;
  }

  @action getUserIds = async () => {
    const records = await this.request.get('/userIds');
    this.userIds = records.data;
    return this.userIds;
  }

  createBarcode = async (registrant) => {
    const badgeFields = [
      "confirmation",
      "firstname",
      "lastname",
      "title",
      "email",
      "phone",
      "organization",
      "address",
      "address2",
      "city",
      "state",
      "zip"
    ];

    let code = `${registrant.paddedRegId}`;
    badgeFields.forEach(
      (field, index) => {
        code += `|${registrant[field]}`;
      }
    );
    const pdf417 = new PDF417();
    let barcode = pdf417.barcode(code, 5);
    let y = 0;
    const bw = 1.25;
    const bh = 0.75;
    let rect = 32000;
    let blocks = [];

    const badgeStr = await mapSeries(
      barcode.bcode,
      async (row) => {
        y += bh;
        let x = 0;
        let colStr = await mapSeries(
          row,
          async (col) => {
            let block = "";
            if (parseInt(col, 10) === 1) {
              block = `<rect id="rect${rect}" height="${bh}" width="${bw}" y="${y}" x="${x}" />`;
            }
            x += bw;
            return block;
          }
        );
        return colStr.join("");
      }
    );

    registrant.barcode = `<g id="barcode" style="fill:#000000;stroke:none" x="23.543152" y="295" transform="translate(64,320)">${badgeStr.join('')}</g>`;
    return registrant;
  };

  renderBadge = async (data, print) => {
    const template = this.getTemplate('badge');
    let dirname = `file://${rootFolder}/`;
    if (process.env.NODE_ENV !== 'development' && process.env.DEBUG_PROD !== 'true') {
      dirname = dirname + "app"
    }
    let registrants;
    if (Array.isArray(data)) {
      registrants = data;
    } else {
      registrants = [data];
    }
    registrants = await mapSeries(registrants, this.createBarcode);
    return template.src({
      dirname,
      registrants,
    });
  }

  @action printBadge = async (registrant) => {
    const print = async (reg) => {
      const src = await this.renderBadge(reg, true);
      this.snackBar.message = 'Printing registrant badge...';
      this.snackBar.open = true;
      ipcRenderer.send(
        'print',
        {
          src: encodeURI(src),
          printer: selected.printer.name,
        }
      );

    }
    this.proposal = null;
    const selected = this.getSelectedPrinter('badge');
    if (selected) {
      if (Array.isArray(registrant)) {
        await map(registrant, print);
      } else {
        await print(registrant);
      }
    } else {
      this.snackBar.message = 'No badge printer configured...';
      this.snackBar.open = true;
    }
    return true;
  }

  @action createNewRegistrant = (data) => {
    this.registrant = this.db.createNewRegistrant(data);
    return this.registrant;
  }

  @action updateRegistrant = (field, value) => {
    this.registrant[field] = value;
    return this.registrant;
  }

  @action resetPayment = () => {
    this.creditCard = {
      cardNumber: '',
      name: '',
      expirationDate: '',
      security: '',
      trackOne: null,
      trackTwo: null,
    };
    this.check = {
      number: '',
    };
  }

  @action saveNewRegistrant = async () => {
    this.snackBar.message = 'Creating registrant...';
    this.snackBar.open = true;
    const registrant = fields.reduce((result, key) => { result[key] = this.registrant[key]; return result; }, {});
    const event = this.events.find(e => e.title === 'Attendee');
    const record = {
      type: 'create',
      fields: registrant,
      id: null,
      type: (this.registrant.exhibitor) ? 'E' : 'G',
      event,
    };
    let result;
    try {
      result = await this.request.post(
        `/registrants`,
        record,
      );
      this.db.update('registrants', result.data);
      this.snackBar.message = 'Registrant created';
    } catch(e) {
      result = e;
      this.snackBar.message = 'Error creating registrant';
    }

    return result;
  }

  renderReceipt = (registrant) => {
    const dirname = (print) ? `file://${rootFolder}/` : '';
    const template = this.getTemplate('receipt');
    const html = template.src({
      dirname,
      registrant: registrant,
    });
    return html;
  }

  printReceipt = (registrant) => {
    const src = this.renderReceipt(registrant);
    const selected = this.getSelectedPrinter('receipt');
    if (selected) {
      ipcRenderer.send(
        'print',
        {
          src,
          printer: selected.printer.name,
        }
      );
    }
  }

  getSiteIdCompanyName = (siteId) => {
    let retVal = siteId ? siteId : this.siteIdQuery ? this.siteIdQuery : '';
    const site = this.siteIds.find(r => r.value === siteId);
    if (site) {
      retVal = `${site.info.company} [${site.info.siteId}] - ${site.info.street1} ${site.info.city}, ${site.info.state}`;
    }
    return retVal;
  }

  @action searchSiteIds = (search) => {
    const options = {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 2,
      keys: [
        "company",
        "siteId",
      ]
    };
    const fuse = new Fuse(this.siteIds, options);
    const records = fuse.search(search);
    this.siteIdsFiltered.replace(records);
    return this.siteIdsFiltered;
  }

  @action searchUserIds = (search) => {
    const options = {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 2,
      keys: [
        "organization",
      ]
    };
    const fuse = new Fuse(this.userIds, options);
    const records = fuse.search(search);
    this.userIdsFiltered.replace(records);
    return this.userIdsFiltered;
  }

  getUserIdCompanyName = (userId) => {
    let retVal = userId ? userId : this.userIdQuery ? this.userIdQuery : '';
    const user = this.userIds.find(r => r.id === userId);
    if (user) {
      retVal = `${user.organization} - ${user.address} ${user.city}, ${user.state}`;
    }
    return retVal;
  }

  @action makePayment = async (type, amount, check) => {
    const trans = (type === 'check') ? this.check : this.creditCard;
    const record = {
      type,
      transaction: Object.assign(
        {},
        trans,
        {
          amount,
        },
      ),
      registrant: this.registrant,
    };
    let result;
    try {
      result = await this.request.post(
        `/payment`,
        record,
      );
      this.db.update('registrants', result.data);
      this.clearCreditCard();
      this.snackBar.message = 'Payment successful';
      this.snackBar.open = true;
    } catch(e) {
      this.snackBar.message = 'Payment failed';
      this.snackBar.open = true;
      result = e;
    }
    //const registrant = this.db.update('registrants', result.data);
    //this.loading = false;
    return result;
  }

  @action resetData = () => {
    this.filters.clear();
    this.getRegistrants();
  }

  isCardValid = () => {
    const numberValidation = valid.number(this.creditCard.number);
    const expValidation = valid.expirationDate(this.creditCard.expirationDate);
    const secValidation = valid.cvv(this.creditCard.security);
    let validCard =  true;
    if (!numberValidation.isValid) {
      validCard = false;
    }

    if (!expValidation.isValid) {
      validCard = false;
    }

    if (!secValidation.isValid) {
      validCard = false;
    }

    if (this.creditCard.trackOne || this.creditCard.trackTwo) {
      validCard = true;
    }

    return validCard;
  }

  @action clearCreditCard = () => {
    const card = {
      name: '',
      cardNumber: '',
      expirationDate: '',
      security: '',
      trackOne: null,
      trackTwo: null,
    };
    this.creditCard = Object.assign(
      {},
      this.creditCard,
      card,
    );
  }

  @action importData = async (type, file) => {
    const result = await this.request.post(
      `/import/${type}`,
      file,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    return result;
  }

  @action downloadTransactions = async () => {
    const result = await this.request.get('/transactions/download');

    return result;
  }

  @action getExhibitors = async (page) => {
    this.paging.page = page;
    this.paging.limit = 50;
    this.sorting.push({
      columnName: 'organization',
      direction: 'asc',
    });
    const registrants = await this.filterRegistrants(true);
    return registrants;
  }

  getExhibitorOptions = async (search) => {
    let retVal = [];
    const data = await this.request.get(
      '/exhibitors/companies',
      {
        params: {
          search,
        },
      },
    );

    retVal = data.data.map(d => ({
      value: d.id,
      label: `${d.organization} - ${d.city}, ${d.state}`,
      type: 'exhibitor',
      info: d,
    }));
    return retVal;
  }

  getSiteIdOptions = async (search) => {
    let retVal = [];
    const data = await this.request.get(
      '/siteid',
      {
        params: {
          search,
        },
      },
    );

    retVal = data.data.map(site => ({
      label: `${site.company} [${site.siteId}] - ${site.street1} ${site.city}, ${site.state}`,
      value: site.siteId,
      type: 'siteId',
      info: site,
    }));
    return retVal;
  }

  @action getAttendeeCount = async (exhibitors) => {
    const type = (exhibitors) ? 'exhibitors' : 'general';
    const result = await this.request.get(`/census/${type}`);
    if (result.data) {
      this.count[type] = result.data[0].total;
    }
    return this.count;
  }

  getExhPrintPages = () => {
    let retVal = [];
    if (this.count.exhibitors > 0) {
      const pageCount = Math.ceil(this.count.exhibitors / 50);
      for(let i=0;i<pageCount;i++) {
        retVal.push(i);
      }
    }

    return retVal;
  }
}
