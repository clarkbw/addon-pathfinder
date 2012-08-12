/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { setTimeout } = require('timers');
const { get, set } = require('preferences-service');
const { add, notify } = require('observer-service');
const { on, once, emit, off } = require('api-utils/event/core');

const PREF_NAME = 'security.addon.panic';
function inPanic() get(PREF_NAME, false);
function setPanic(value) set(PREF_NAME, value);

const PREF_END_NAME = 'security.addon.panic_end';
function getEndTime() get(PREF_END_NAME, 0);
function setEndTime(timestamp) set(PREF_END_NAME, timestamp);

Object.defineProperty(exports, "inPanic", {
  get: inPanic()
});

const panic = function (ms) {
  ms = ms || 0;
  let endTime = Date.now() + ms;

  // check that the current end timestamp is not greater
  if (getEndTime() >= endTime)
    return;

  // set the end timestamp (to handle the reboot situation)
  setEndTime(Date.now() + ms);

  // notify system of a panic
  notify('panic-start');

  // end the panic
  setTimeout(function() {
    // check that the end timestamp was not extended by another instance
    if (getEndTime() > Date.now()) return;

    notify('panic-end');
  }, ms);
};
exports.panic = panic;

const panicEmitter = {};

exports.on = on.bind(null, panicEmitter);
exports.once = once.bind(null, panicEmitter);
exports.off = off.bind(null, panicEmitter);

add('panic-start', function () {
  setPanic(true);
  emit(panicEmitter, 'start');
});
add('panic-end', function () {
  setPanic(false);
  emit(panicEmitter, 'end');
});

// check the end timestamp (for the reboot situation)
if (getEndTime() <= Date.now()) {
  setEndTime(0);

  if (inPanic()) {
    setPanic(false);
  }
}
