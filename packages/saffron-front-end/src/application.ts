import BaseApplication from 'saffron-common/src/application/base';

import fragments from './fragments';

export default class BrowserApplication extends BaseApplication {
  _registerFragments() {
    super._registerFragments();
    this.fragments.register(...fragments);
  }
}
 