import { observable, toJS } from 'mobx';
import { createTransformer } from 'mobx-utils';
import flow from 'lodash.flow';
import concat from 'lodash.concat';
import moment from 'moment';
import Registrant from './Tables';

const serialize = createTransformer(row => ({ ...row }));

export default class Database {
  @observable registrants = observable.map();

  initialize(table, data) {
    const self = this;
    data.forEach((record) => {
      const newData = new Registrant(record);
      self[table].set(newData.paddedRegId, newData);
    });
    return this;
  }

  filter(table, funcs) {
    return flow(...concat([], funcs))(this[table].values());
  }

  update(table, record) {
    const newData = new Registrant(record);
    this[table].set(newData.paddedRegId, newData);
    return newData;
  }

  getData(table) {
    const records = [];
    this[table].forEach(r => {
      records.push(serialize(r));
    })
    return records;
  }

  createNewRegistrant(data) {
    return new Registrant(data);
  }

  getRecord(table, id) {
    return this[table].get(id);
  }
}
