"use strict";

const {AddonManager, AddonManagerPrivate} = require("./utils/addonmanager");
const Addon = require("addon").Addon;

exports.getAddonByID = exports.getAddonById = function(aID, aCallback) {
  // get the addon obj
  AddonManager.getAddonByID(aID, function (addon) {
    // return a wrapped addon
    aCallback(new Addon(addon));
  });
};
