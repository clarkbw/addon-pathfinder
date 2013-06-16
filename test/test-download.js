/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

const { Ci, Cc, Cu } = require('chrome');
const { pathFor } = require("sdk/system");
const { Loader } = require("sdk/test/loader");
const { Request } = require('sdk/request');
const options = require("@test/options");

const { Download } = require('download');

const { Services } = require('services');

exports.testDownload = function(assert, done) {console.log(1)
  const loader = Loader(module);
  const httpd = loader.require('sdk/test/httpd');
  const { startServerAsync } = httpd;

  let serverPort = 8057;
  let server = httpd.startServerAsync(serverPort);
  const contents = "testDownload";

  server.registerPathHandler("/test.txt", function handle(request, response) {
    response.write(contents);
  });

  let file = Services.dirsvc.get("ProfD", Ci.nsIFile);
  file.append("test.txt");

  assert.ok(!file.exists(), 'Download does not exist yet');

  let download = Download({
    url: "http://localhost:" + serverPort + "/test.txt",
    destination: file.path,
    onComplete: function() {
      assert.ok(file.exists(), 'Download was successful');

      Request({
        url: Services.io.newFileURI(file).spec,
        overrideMimeType: "text/plain; charset=latin1",
        onComplete: function ({ text }) {
          assert.equal(text, contents, 'the file content is correct');
          file.remove(false);
          assert.ok(!file.exists(), 'File was removed');
          loader.unload();
          done();
        }
      }).get();
    }
  });
  assert.ok(!!download, 'Download started');
}

require("test").run(exports);