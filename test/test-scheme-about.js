'use strict';

const { Loader } = require('sdk/test/loader');
const tabs = require('sdk/tabs')

exports.testAddAboutWhat = function(assert, done) {
  const loader = Loader(module);
  const { add } = loader.require('pathfinder/scheme/about');

  add({
  	what: 'test',
    url: 'data:text/html;charset=utf-8,<body>test</body>'
  });

  tabs.open({
  	url: 'about:test',
  	inBackground: true,
  	onReady: function(tab) {
      let worker = tab.attach({
        contentScript: 'self.port.emit("body", document.body.innerHTML)'
      })
      worker.port.on('body', function(msg) {
        assert.equal(msg, 'test', 'about:test content is "test"');
        tab.close(function() {
          loader.unload();
          done();
        });
      });
  	}
  })
}

require('test').run(exports);
