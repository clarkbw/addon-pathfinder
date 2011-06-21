/* ***** BEGIN LICENSE BLOCK *****
 * Version: MIT/X11 License
 * 
 * Copyright (c) 2010 Erik Vold
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

const global = this;
const {Cc,Ci,Cu} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm", global);

exports.locale = Cc["@mozilla.org/chrome/chrome-registry;1"]
    .getService(Ci.nsIXULChromeRegistry).getSelectedLocale("global");

exports.l10n = (function(global) {
  let splitter = /(\w+)-\w+/;

  // get user's locale
  let locale = exports.locale;

  function getStr(aStrBundle, aKey) {
    if (!aStrBundle) return false;
    try {
      return aStrBundle.GetStringFromName(aKey);
    } catch (e) {
      console.log(e);
    }
    return "";
  }

  function l10n(options) {
    var filename = options.filename;
    var baseURL = options.baseURL;
    var defaultLocale = options.defaultLocale || "en";
    function filepath(locale) {
      var path = baseURL + "/" + locale + "/" + filename;
      console.log(path);
      return path;
    }

    let defaultBundle = Services.strings.createBundle(filepath(locale));

    let defaultBasicBundle;
    let (locale_base = locale.match(splitter)) {
      if (locale_base) {
        defaultBasicBundle = Services.strings.createBundle(
            filepath(locale_base[1]));
      }
    }

    let addonsDefaultBundle =
        Services.strings.createBundle(filepath(defaultLocale));

    return _ = function l10n_underscore(aKey, aLocale) {
      let localeBundle, localeBasicBundle;
      if (aLocale) {
        localeBundle = Services.strings.createBundle(filepath(aLocale));

        let locale_base = aLocale.match(splitter)
        if (locale_base)
          localeBasicBundle = Services.strings.createBundle(
              filepath(locale_base[1]));
      }

      var x = getStr(localeBundle, aKey)
          || getStr(localeBasicBundle, aKey)
          || getStr(defaultBundle, aKey)
          || getStr(defaultBasicBundle, aKey)
          || getStr(addonsDefaultBundle, aKey);
      return x;
    }
  }

  return l10n;
})(this);

require("unload").when(Services.strings.flushBundles);

