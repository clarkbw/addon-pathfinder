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
"use strict";

const windowUtils = require("window-utils");
const {Class} = require("heritage");
const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

var Menuitem = function Menuitem(options) {
  if (!(this instanceof Menuitem)) {
    return new Menuitem(options);
  }

  var menuitems = [];

  var label = options.label+"";
  this.__defineGetter__("label", function() {
    return label;
  });
  this.__defineSetter__("label", function(val) {
    label = val;
    menuitems.forEach(function(menuitem) {
      if (!menuitem) return;
      menuitem.setAttribute("label", label);
    });
    return label;
  });

  var disabled = !!(options.disabled || false);
  this.__defineGetter__("disabled", function() {
    return disabled;
  });
  this.__defineSetter__("disabled", function(val) {
    disabled = !!val;
    menuitems.forEach(function(menuitem) {
      if (!menuitem) return;
      menuitem.setAttribute("disabled", disabled+"");
    });
    return disabled;
  });
  this.clone = function (overwrites) {
    let opts = Object.clone(options);
    for (let key in overwrites) {
      opts[key] = ovrewrites[key];
    }
    return Menuitem(opts);
  };

  // setup window tracker
  windowUtils.WindowTracker({
    onTrack: function (window) {
      if ("chrome://browser/content/browser.xul" != window.location) return;

      let $ = function(id) window.document.getElementById(id);

      // remove any old element with this id..
      (function(menuitem) {
        menuitem && menuitem.parent.removeChild(menuitem);
      })($(options.id));

      var onCmd = function() {
        options.onCommand && options.onCommand();
      };

      // add the new menuitem to a menu
      var menuitem = window.document.createElementNS(NS_XUL, "menuitem");
      menuitem.setAttribute("id", options.id);
      var menuitems_i = menuitems.push(menuitem) - 1;

      menuitem.setAttribute("label", label);

      if (options.accesskey)
        menuitem.setAttribute("accesskey", options.accesskey);

      if (options.key)
        menuitem.setAttribute("key", options.key);

      if (options.image) {
        menuitem.classList.add("menuitem-iconic");
        menuitem.style.listStyleImage = "url('" + options.image + "')";
      }

      if (options.className) {
        options.className.split(/\s+/).forEach(function(name) menuitem.classList.add(name));
      }

      menuitem.addEventListener("command", onCmd, true);

      if (options.menuid) {
        if (options.menuid instanceof Array) {
            let ids = options.menuid;
            for (var len = ids.length, i = 0; i < len; i++) {
              if (tryParent($(ids[i]), menutiem, options.insertbefore))
                break;
            }
        }
        else {
          tryParent($(options.menuid), menuitem, options.insertbefore);
        }
      }

      // add unloader
      require("unload+").unload(function() {
        menuitem.parentNode.removeChild(menuitem);
        menuitems[menuitems_i] = null;
      }, window);
    }
  });

  return this;
};

function tryParent(parent, menuitem, before) {
  if (parent) parent.insertBefore(menuitem, insertBefore(parent, before));
  return !!parent;
}

function insertBefore(parent, insertBefore) {
  if (typeof insertBefore == "number") {
    switch (insertBefore) {
    case Menuitem.FIRST_CHILD:
      return parent.firstChild;
    }
    return null;
  }
  return insertBefore;
}

Menuitem.FIRST_CHILD = 1;

exports.Menuitem = Menuitem;
