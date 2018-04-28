import { observable } from 'mobx';

export default class Registrant {
  @observable id = null;
  @observable confirmation = "";
  @observable pin = "";
  @observable firstname = "";
  @observable lastname = "";
  @observable address = "";
  @observable address2 = "";
  @observable city = "";
  @observable state = "";
  @observable zip = "";
  @observable email = "";
  @observable phone = "";
  @observable management = false;
  @observable title = "";
  @observable organization = "";
  @observable siteId = "";
  @observable attend = true;
  @observable checked_in_time = null;
  @observable isCheck = null;
  @observable groupConfirm = "";
  @observable speaker = false;
  @observable exhibitor = false;
  @observable osha = false;
  @observable createdAt = "";
  @observable updatedAt = "";
  @observable deletedAt = null;
  @observable confirmNum = "";
  @observable siteid = "";
  @observable company = "";
  @observable street1 = "";
  @observable street2 = null;
  @observable zipcode = "";
  @observable registrantId = "";
  @observable paddedRegId = "";
  @observable displayId = "";
  @observable badge_prefix = "";
  @observable fields = {};
  @observable badgeFields = [];
  @observable event = null;
  @observable schema = {};
  @observable fieldset = [];
  @observable transactions = [];
  @observable paid = false;
  @observable biller = {};
  @observable linked = [];
  @observable site = {};
  @observable badgeSchema = [];

  constructor(data) {
    if (data) {
      Object.keys(data).forEach(k => {
        this[k] = data[k];
      });
    }
  }
}