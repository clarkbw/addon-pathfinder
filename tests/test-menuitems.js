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
  test.assertEqual(!!$(options.id), true, 'menuitem exists');
};
