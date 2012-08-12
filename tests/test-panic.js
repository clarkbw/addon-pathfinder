/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const panic = require('panic');
const { Loader } = require("test-harness/loader");

// TEST: the inPanic variable and panic events
exports.testPanicInPanic = function(test) {
  test.waitUntilDone();

  test.assertEqual(panic.inPanic, false, "not in a panic");
  panic.once('start', function() {
    test.pass('"start" event was fired');
    test.assertEqual(panic.inPanic, true, "in a panic");

    panic.once('end', function() {
      test.pass('"end" event was fired');
      test.assertEqual(panic.inPanic, false, "not in a panic");

      // end test
      test.done();
    });
  });

  panic.panic();
};

// TEST: on and off methods
exports.testPanicOnOff = function(test) {
  test.waitUntilDone();

  let count = 0;

  panic.on('start', function panicOn() {
    panic.off('start', panicOn);
    count++;

    panic.once('start', function() {
      if (count > 1) {
        test.fail('panic.on was called too many times');
      }
      else {
        test.pass('panic.on was only called once');
      }

      panic.once('end', function() {
        // end test
        test.done();
      });
    });

    panic.panic(50);
  });

  panic.panic();
};

// TEST: panic emits in multiple instances
exports.testPanicFiresInMultipleInstances = function(test) {
  test.waitUntilDone();
  let count = 0;

  let loader = Loader(module);
  let panic2 = loader.require('panic');

  let testCounter = function() {
    if (++count < 2) return;
    test.pass('panic was fired on multiple instances');

    panic.once('end', function() {
      loader.unload();

      // end test
      test.done();
    });
  };
  panic.once('start', testCounter);
  panic2.once('start', testCounter);

  panic.panic();
};
