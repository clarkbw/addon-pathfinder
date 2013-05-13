'use strict';

const { Cc, Ci } = require("chrome");
const xpcom = require("xpcom");

const { Class } = require('sdk/core/heritage');
const CP_NS = require('sdk/core/namespace').ns();
const { when: unload } = require('unload');
const { URL } = require('url');
const { validateOptions } = require("sdk/deprecated/api-utils");
const { id: ADDON_ID } = require('self');

const CM = Cc["@mozilla.org/categorymanager;1"]
    .getService(Ci.nsICategoryManager);

const ACCEPT = exports.ACCEPT = Ci.nsIContentPolicy.ACCEPT;
const REJECT = exports.REJECT = Ci.nsIContentPolicy.REJECT_REQUEST;

const accept = function() ACCEPT;

let ContentPolicy_ID = 0;

const RULES = {
  description: {
    map: function(v) {
      return v ? v : '';
    },
    is: ['string']
  },
  contract: {
    map: function(v) {
      if (v === undefined) {
        v = '@erikvold.com/content-policy.' + ADDON_ID + ';' + ContentPolicy_ID++;
      }
      return v;
    },
    is: ['string']
  },
  entry: {
    is: ['string', 'undefined']
  },
  shouldLoad: {
    is: ['function', 'undefined']
  },
  shouldProcess: {
    is: ['function', 'undefined']
  },
};

function getType(aType) {
  switch (aType) {
    case Ci.nsIContentPolicy.TYPE_SCRIPT:
      return 'script';
    case Ci.nsIContentPolicy.TYPE_IMAGE:
      return 'image';
    case Ci.nsIContentPolicy.TYPE_STYLESHEET:
      return 'stylesheet';
    case Ci.nsIContentPolicy.TYPE_OBJECT:
      return 'object';
    case Ci.nsIContentPolicy.TYPE_DOCUMENT:
      return 'document';
    case Ci.nsIContentPolicy.TYPE_SUBDOCUMENT:
      return 'subdocument';
    case Ci.nsIContentPolicy.TYPE_REFRESH:
      return 'refresh';
    case Ci.nsIContentPolicy.TYPE_XBL:
      return 'xbl';
    case Ci.nsIContentPolicy.TYPE_XMLHTTPREQUEST:
      return 'xhr';
    case Ci.nsIContentPolicy.TYPE_PING:
      return 'ping';
    // TODO: support more types
  }
  return 'other';
}

function makeDetails(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess) {
  return {
    type: getType(aContentType),
    location: URL(aContentLocation.spec),
    origin: URL(aRequestOrigin.spec),
    context: null, // TODO: support this in a safe way somehow..
    mimeTypeGuess: String(aMimeTypeGuess)
  };
}

let ContentPolicy = exports.ContentPolicy = Class({
  initialize: function(options) {
    const self = this;
    options = CP_NS(self).options = validateOptions(options, RULES);
    CP_NS(self).shouldLoad = options.shouldLoad || accept;
    CP_NS(self).shouldProcess = options.shouldProcess || accept;

    let RequestPreventer = Class({
      extends: xpcom.Unknown,
      interfaces: ["nsIContentPolicy"],
      shouldLoad: function (aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
        let load = CP_NS(self).shouldLoad(makeDetails.apply(null, arguments));
        return (load == REJECT || (!load && load !== undefined)) ? REJECT : ACCEPT;
      },
      shouldProcess: function (aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
        let load = CP_NS(self).shouldProcess(makeDetails.apply(null, arguments));
        return (load == REJECT || (!load && load !== undefined)) ? REJECT : ACCEPT;
      }
    });

    let factory = CP_NS(this).factory = xpcom.Factory({
      Component: RequestPreventer,
      description: options.description,
      contract: options.contract
    });

    CM.addCategoryEntry('content-policy', options.entry || options.contract, factory.contract, false, true);
    unload(this.destroy.bind(this));
  },
  destroy: function() {
    // already destroyed?
    if (!CP_NS(this).options)
      return;

    let options = CP_NS(this).options;
    CM.deleteCategoryEntry("content-policy", options.entry || options.contract, false);
    CP_NS(this).options = null;
  }
});
