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

const {AddonManager, AddonManagerPrivate, AddonType} = require("./utils/addonmanager");

var defaultUIPriority = 6001; // this increases when it is used

exports.AddonProvider = function(options) {
  var types = null;

  // AddonManagerPrivate.AddonType DNE in Gecko (FF) < 6
  if (AddonType) {
      types = [new AddonType(
        options.type,  // TODO: RANDOMIZE?
        null,
        options.localeKey,
        AddonManager.VIEW_TYPE_LIST,
        options.uiPriority || defaultUIPriority++)];
  }

  var provider = {
    getAddonByID: function(aId, aCallback) {
      aCallback(options.getAddonByID(aId));
    },

    getAddonsByTypes: function(aTypes, aCallback) {
      if (aTypes && aTypes.indexOf(options.type) < 0) {
        // not the right type, return nothing
        aCallback([]);
      }
      else {
        // the right type, return all addons
        aCallback(options.getAddons());
      }
    },

    getInstallsByTypes: function(aTypes, aCallback) {
      aCallback([]);
    }
  };
  AddonManagerPrivate.registerProvider(provider, types);

  require("unload").when(function() {
    AddonManagerPrivate.unregisterProvider(provider);
  });

  return this;
};
