/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

const { Ci, Cc, Cu } = require('chrome');
const { pathFor } = require("sdk/system");
const { Loader } = require("sdk/test/loader");
const options = require("@test/options");

const { Download } = require('download');

const { Services } = Cu.import('resource://gre/modules/Services.jsm', {});

exports.testDownload = function(assert, done) {
  const loader = Loader(module);
  const httpd = loader.require("sdk/test/httpd");
  const { startServerAsync } = httpd;

  let serverPort = 8054;
  let server = httpd.startServerAsync(serverPort);
  server.registerPathHandler("/test.txt", function handle(request, response) {
    response.write('TEST');
  });

  let file = Services.dirsvc.get("ProfD", Ci.nsIFile);
  file.append("test.txt");

  assert.ok(!file.exists(), 'Download does not exist yet');
  let download = Download({
    url: "http://localhost:" + serverPort + "/test.txt",
    destination: file.path,
    onComplete: function() {
      assert.ok(file.exists(), 'Download was successful');
      file.remove(false);
      assert.ok(!file.exists(), 'File was removed');
      loader.unload();
      done();
    }
  });
  assert.ok(!!download, 'Download started');
}

require("test").run(exports);