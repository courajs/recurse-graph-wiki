import Service, {inject as service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class Auth extends Service {
  @service idb;
  @service sw;

  @tracked authState = 'pending';
  @tracked clientId;

  constructor() {
    super(...arguments);

    this.awaitAuth = new Promise((resolve) => {
      this._authed = resolve;
    });
    this.awaitAuthChecked = new Promise((resolve) => {
      this._authChecked = resolve;
    });
    
    this.sw.on('authed', (as) => {
      this.authState = 'authed';
      this.clientId = as;
      this._authed();
    });

    this._checkForId();
  }

  async _checkForId() {
    let db = await this.idb.db;
    let id = await db.get('meta', 'client_id');
    if (id) {
      this.authState = 'authed';
      this.clientId = id;
      this._authed();
    } else {
      this.authState = 'unauthed';
    }
    this._authChecked();
  }

  authenticateAs(id) {
    this.sw.send({kind:'auth',value:id});
  }
}