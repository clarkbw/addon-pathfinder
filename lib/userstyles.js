/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim:set ts=2 sw=2 sts=2 et: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { Cc, Ci } = require("chrome");
const unload = require("unload").when;

/**
 * Load various packaged styles for the add-on and undo on unload
 *
 * @usage load(aURL): Load specified style
 * @param [string] aURL: Style file to load
 */
exports.load = function load(aURL) {
  let sss = Cc["@mozilla.org/content/style-sheet-service;1"]
      .getService(Ci.nsIStyleSheetService);
  let uri = Cc["@mozilla.org/network/io-service;1"]
      .getService(Ci.nsIIOService).newURI(aURL, null, null);

  // load the stylesheet
  sss.loadAndRegisterSheet(uri, sss.USER_SHEET);

  // unload the stylesheet on unload
  unload(function() {
    sss.unregisterSheet(uri, sss.USER_SHEET);
  });
}

exports.registered = function(aURL) {
  var sss = Cc["@mozilla.org/content/style-sheet-service;1"]
      .getService(Ci.nsIStyleSheetService);
  var uri = Cc["@mozilla.org/network/io-service;1"]
      .getService(Ci.nsIIOService).newURI(aURL, null, null);

  // check that the stylesheet is registered
  return !!sss.sheetRegistered(uri, sss.USER_SHEET);
}
