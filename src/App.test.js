const Application = require('spectron').Application;
const assert = require('assert');
const path=require('path')
describe('My React app',function() {
 //this.timeout(10000); // Increase timeout for slower machines
    let app;
    const appPath = path.join(__dirname, '..', 'src', 'index.js')

    beforeEach(function() {
      app = new Application({
        path:appPath, // Replace with the path to your app
        args: [] // Replace with any command line arguments your app requires
      });
      return app.start();
    });
  
    afterEach(function() {
      if (app && app.isRunning()) {
        return app.stop();
      }
    });
    it('shows a window', function() {
        return app.client.getWindowCount().then(function(count) {
          assert.equal(count, 1);
        });
      });
      
  });
  
