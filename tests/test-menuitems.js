/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict'

const windowUtils = require("window-utils");
const menuitems = require("menuitems");

let window = windowUtils.activeBrowserWindow;
let document = window.document;
function $(id) document.getElementById(id);

function createMI(options, test) {
  test.assertEqual(!$(options.id), true);
  var mi = new menuitems.Menuitem(options);
  return mi;
}

exports.testMIDoesNotExist = function(test) {
  var options = {
    id: "test-mi-dne",
    label: "test"
  };
  createMI(options, test);
  test.assertEqual(!!$(options.id), false, 'menuitem does not exists');
};

exports.testMIDoesExist = function(test) {
  var options = {
    id: "test-mi-exists",
    label: "test",
    menuid: 'menu_FilePopup'
  };
  createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');
  test.assertEqual(menuitem.id, options.id, 'menuitem id is ok');
  test.assertEqual(menuitem.getAttribute('label'), options.label, 'menuitem label is ok');
  test.assertEqual(menuitem.parentNode.id, options.menuid, 'in the file menu');
  test.assertEqual(menuitem.getAttribute('disabled'), '', 'menuitem not disabled');
  test.assertEqual(menuitem.getAttribute('accesskey'), '', 'menuitem accesskey is ok');
  test.assertEqual(menuitem.getAttribute('class'), '', 'menuitem class is ok');
  test.assertEqual(menuitem.nextSibling, undefined, 'menuitem is last');
};

exports.testMIOnClick = function(test) {
  test.waitUntilDone();

  let options = {
    id: "test-mi-onclick",
    label: "test",
    menuid: 'menu_FilePopup',
    onCommand: function() {
      mi.detroy();
      test.pass('onCommand worked!');
      test.done();
    }
  };

  let e = document.createEvent("UIEvents");
  e.initUIEvent("command", true, true, window, 1);

  var mi = createMI(options, test);
  let menuitem = $(options.id);
  test.assertEqual(!!menuitem, true, 'menuitem exists');
  menuitem.dispatchEvent(e);
};
