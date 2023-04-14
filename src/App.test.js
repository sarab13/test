const Application = require('spectron').Application;
const assert = require('assert');

describe('Electron App', function() {
  this.timeout(10000);

  beforeEach(function() {
    this.app = new Application({
      path: './',
      args: []
    });
    return this.app.start();
  });

  afterEach(function() {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('should open a window', function() {
    return this.app.client.getWindowCount().then(function(count) {
      assert.equal(count, 1);
    });
  });

  
});
