/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

const { Loader } = require('sdk/test/loader');
const tabs = require('sdk/tabs');
const { setTimeout } = require('sdk/timers');

const cp = require('content-policy');

exports.testConstants = function(assert) {
  assert.ok(cp.REJECT != undefined, 'REJECT constant exists');
  assert.ok(cp.ACCEPT != undefined, 'ACCEPT constant exists');
  assert.ok(cp.ContentPolicy != undefined, 'ContentPolicy constant exists');
};

exports.testContentPolicyDestroy = function(assert, done) {
  const loader = Loader(module);
  const httpd = loader.require('sdk/test/httpd');
  const { ContentPolicy } = loader.require('content-policy')
  const { startServerAsync } = httpd;
  let tabsCount = tabs.length;
  let tab1;

  let serverPort = 8056;
  let server = httpd.startServerAsync(serverPort);
  const contents = '<!DOCTYPE html><html><head></head><body>testContentPolicyDestroy</body></html>';
  // test.html
  let testPageRequests = 0;
  server.registerPathHandler('/test.html', function handle(request, response) {
  	testPageRequests++;
    response.write(contents);
  });

  let url = 'http://localhost:' + serverPort + '/test.html';

  let rejected = false;
  let policy = ContentPolicy({
    shouldLoad: function({ location }) {
      if (location.toString() != url)
        return true;

      setTimeout(function() {
        policy.destroy();

        tabs.open({
          url: url,
          inBackground: true,
          onReady: function (tab2) {
            assert.equal(tab2.url, url, url);
            tab2.close(function() tab1.close());
          }
        });
        assert.pass('tab2 opening..');
      }, 0);
      return false;
    },
    shouldProcess: function({ location }) {
      assert.pass('shouldLoad: ' + location);
    }
  });
  assert.pass('Content policy is setup');

  setTimeout(function() {
    tabs.open({
      url: url,
      inBackground: true,
      onOpen: function (tab) {
        tab1 = tab;
        assert.equal(tab1.url, 'about:blank', 'tab1 opened - about:blank');
      },
      onReady: function() {
        assert.fail('tab1 loaded..');
      },
      onClose: function() {
        assert.equal(testPageRequests, 1, 'test page was only requested once');
        //assert.equal(tabsCount, tabs.length, 'all test tabs are closed');
        loader.unload();
        done();
      }
    });

    assert.pass('tab1 opening..');
  }, 500);
};

require('test').run(exports);
