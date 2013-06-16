"use strict";

const {Cc, Ci, Cu} = require("chrome");

exports.getZipReader = function(aFile) {
  var zipReader = Cc["@mozilla.org/libjar/zip-reader;1"]
      .createInstance(Ci.nsIZipReader);
  zipReader.open(aFile);
  return zipReader;
};
