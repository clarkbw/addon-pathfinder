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
 *   Szabolcs Hubai <szab.hu@gmail.com>
 *
 * ***** END LICENSE BLOCK ***** */

const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

exports.XulKey = function XulKey(options) {
  var delegate = {
    onTrack: function (window) {
      if ("chrome://browser/content/browser.xul" != window.location) return;

      let doc = window.document;
      function $(id) doc.getElementById(id);
      function xul(type) doc.createElementNS(NS_XUL, type);

      var onCmd = function() {
        options.onCommand && options.onCommand();
      };

      var keyset = xul("keyset");

      // add hotkey
      var key = xul("key");
      key.setAttribute("id", options.id);
      key.setAttribute("key", options.key);
      if (options.modifiers)
        key.setAttribute("modifiers", options.modifiers);
      key.setAttribute("oncommand", "void(0);");
      key.addEventListener("command", onCmd, true);
      ($("mainKeyset") || $("mailKeys")).parentNode.appendChild(keyset).appendChild(key);

      // add unloader
      require("unload+").unload(function() {
        key.removeEventListener("command", onCmd, true); // must do for some reason..
        keyset.parentNode.removeChild(keyset);
      }, window);
    },
    onUntrack: function (window) {}
  };
  var winUtils = require("window-utils");
  var tracker = new winUtils.WindowTracker(delegate);
};
