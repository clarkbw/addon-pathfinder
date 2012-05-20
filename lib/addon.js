/* ***** BEGIN LICENSE BLOCK *****
 * Version: MIT/X11 License
 * 
 * Copyright (c) 2011 Erik Vold
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Contributor(s):
 *   Erik Vold <erikvvold@gmail.com> (Original Author)
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

const {Cc, Ci, Cu} = require("chrome");
const {AddonManager, AddonAuthor} = require("./utils/addonmanager");
const DO_NOTHING = function(){};

// https://developer.mozilla.org/en/Addons/Add-on_Manager/Addon
function Addon(options) {

  this.appDisabled = !!options.appDisabled || false;
  this.blocklistState = (options.blocked) ? 2 : 0;
  if (options.creator) {
    this.creator = new AddonAuthor(options.creator.name);
  }
  this.id = options.id;
  if (typeof options.isActive != "undefined") this.isActive = !!options.isActive;
  if (typeof options.isCompatible != "undefined") this.isCompatible = !!options.isCompatible;
  if (typeof options.isPlatformCompatible != "undefined") this.isPlatformCompatible = !!options.isPlatformCompatible;
  this.name = options.name || "";
  //this.pendingOperations = 
  this.description = options.description || "";
  if (options.iconURL) this.iconURL = options.iconURL;

  // METHODS
  this.uninstall = function() {
    options.uninstall && options.uninstall();
  };
  this.cancelUninstall = function() {
    options.cancelUninstall && options.cancelUninstall();
  };

  if (options.getResourceURI) {
    this.getResourceURI = function(aPath) {
      return options.getResourceURI(aPath);
    };
    this.getXPI = function() {
      return options.getResourceURI("").QueryInterface(Ci.nsIFileURL).file;
    }
  }

  return this;
};

Addon.prototype = {
  // req'd
  appDisabled: false,
  blocklistState: 0,
  creator: null,
  id: null,
  isActive: true,
  isCompatible: true,
  isPlatformCompatible: true,
  name: null,
  pendingOperations: AddonManager.PENDING_NONE,
  permissions: AddonManager.PERM_CAN_UNINSTALL,
  providesUpdatesSecurely: false,
  scope: AddonManager.SCOPE_PROFILE,
  type: null,
  userDisabled: false,
  version: null,
  
  //not reqd
  applyBackgroundUpdates: AddonManager.AUTOUPDATE_DISABLE,
  contributors: [],
  description: "",
  translators: [],
  sourceURI: null,
  

  // METHODS
  uninstall: DO_NOTHING,
  findUpdates: DO_NOTHING,
  cancelUninstall: DO_NOTHING,
  hasResource: DO_NOTHING
};

exports.Addon = Addon;
