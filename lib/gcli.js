'use strict';

const { Cu } = require('chrome');
const { when: unload } = require('unload');

Cu.import("resource:///modules/devtools/gcli.jsm");

function addCommand(cmd) {
  let name = cmd.name;
  gcli.addCommand(cmd);
  unload(gcli.removeCommand.bind(gcli, name));
}
exports.addCommand = addCommand;
exports.removeCommand = gcli.removeCommand;
