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

const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

exports.ToolbarButton = function ToolbarButton(options) {
  var delegate = {
    onTrack: function (window) {
      if ("chrome://browser/content/browser.xul" != window.location) return;

      let doc = window.document;
      function $(id) doc.getElementById(id);
      function xul(type) doc.createElementNS(NS_XUL, type);

      // add toolbar button
      let tbb = xul("toolbarbutton");
      tbb.setAttribute("id", options.id);
      tbb.setAttribute("type", "button");
      if (options.image) tbb.setAttribute("image", options.image);
      tbb.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
      tbb.setAttribute("label", options.label);
      tbb.addEventListener("command", function() {
        options.onCommand({}); // TODO: provide something?
      }, true);
      ($("navigator-toolbox") || $("mail-toolbox")).palette.appendChild(tbb);

      var toolbars = doc.getElementsByTagNameNS(NS_XUL, "toolbar");
      var tb;
      for (var i = toolbars.length - 1; ~i; i--) {
        if ((new RegExp("(?:^|,)" + options.id + "(?:,|$)")).test(toolbars[i].getAttribute("currentset")))
          tb = toolbars[i];
      }
      if (!tb) {
        tb = $(options.toolbarID);
      }

      // insert the toolbar?
      if (tb) {
        let b4 = $(options.insertbefore);
        if (!b4) { // insert in last known location
          let currentset = tb.getAttribute("currentset").split(",");
          let i = currentset.indexOf(options.id) + 1;
          if (i > 0) {
            let len = currentset.length;
            for (; i < len; i++) {
              b4 = $(currentset[i]);
              if (b4) break;
            }
          }
        }

        tb.insertItem(options.id, b4, null, false);
      }

      // add unloader
      require("unload+").unload(function() {
        tbb.parentNode.removeChild(tbb);
      }, window);
    },
    onUntrack: function (window) {}
  };
  var winUtils = require("window-utils");
  var tracker = new winUtils.WindowTracker(delegate);
};
