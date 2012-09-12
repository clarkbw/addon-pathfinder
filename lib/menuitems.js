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
const { Class } = require("heritage");
const { validateOptions } = require("api-utils/api-utils");
const { on, emit, once, off } = require("api-utils/event/core");

const menuitemNS = require("namespace").ns();
const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

function MenuitemOptions(options) {
  return Object.clone(validateOptions(options, {
    id: { is: ['string'] },
    label: { is: ["string"] },
    disabled: { is: ["undefined", "boolean"] },
    accesskey: { is: ["undefined", "string"] },
    key: { is: ["undefined", "string"] },
    className: { is: ["undefined", "string"] },
  }));
}

let Menuitem = Class({
  initialize: function(options) {
    menuitemNS(this).options = options = MenuitemOptions(options);

    menuitemNS(this).menuitems = addMenuitem(this, options).menuitems;

    if (options.onCommand)
      on(this, 'command', options.onCommand);

    return this;
  },
  get id() menuitemNS(this).options.id,
  get label() menuitemNS(this).options.label,
  set label(val) updateProperty(this, 'label', val),
  get disabled() menuitemNS(this).options.disabled,
  set disabled(val) updateProperty(this, 'disabled', val),
  get key() menuitemNS(this).options.key,
  set key(val) updateProperty(this, 'key', val),
  clone: function (overwrites) {
    let opts = Object.clone(menuitemNS(this).options);
    for (let key in overwrites) {
      opts[key] = ovrewrites[key];
    }
    return Menuitem(opts);
  },
  get menuid() menuitemNS(this).options.menuid,
  set menuid(val) {
    let options = menuitemNS(this).options;
    options.menuid = val;

    forEachMI(function(menuitem, i, $) {
      updateMenuitemParent(menuitem, options, $);
    });
  }
});

function addMenuitems(self, options) {
  let menuitems = [];

  // setup window tracker
  windowUtils.WindowTracker({
    onTrack: function (window) {
      if ("chrome://browser/content/browser.xul" != window.location) return;

      // add the new menuitem to a menu
      var menuitem = updateMenuitemAttributes(
          window.document.createElementNS(NS_XUL, "menuitem"), options);
      var menuitems_i = menuitems.push(menuitem) - 1;

      // add the menutiem to the ui
      updateMenuitemParent(menuitem, options, function(id) window.document.getElementById(id));

      menuitem.addEventListener("command", emit.bind(null, self, 'command'), true);
  
      // add unloader
      require("unload+").unload(function() {
        menuitem.parentNode.removeChild(menuitem);
        menuitems[menuitems_i] = null;
      }, window);
    }
  });
  return {menuitems: menuitems};
}

function updateMenuitemParent(menuitem, options, $) {
  // add the menutiem to the ui
  if (options.menuid) {
    if (options.menuid instanceof Array) {
        let ids = options.menuid;
        for (var len = ids.length, i = 0; i < len; i++) {
          if (tryParent($(ids[i]), menuitem, options.insertbefore))
            break;
        }
    }
    else {
      tryParent($(options.menuid), menuitem, options.insertbefore);
    }
  }
}

function updateMenuitemAttributes(menuitem, options) {
  menuitem.setAttribute("id", options.id);
  menuitem.setAttribute("label", options.label);

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

  return menuitem;
}

updateProperty(menuitem, key, val) {
  menuitemNS(menuitem).options[key] = val;
  forEachMI(function(menuitem) {
    menuitem.setAttribute("disabled", val);
  }, this);
  return val;
}

function forEachMI(callback, menuitem) {
  menuitemNS(menuitem).menuitems.forEach(function(mi, i) {
    if (!mi) return;
    callback(mi, i, function(id) mi.ownerDocument.getElementById(id));
  });
}

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
