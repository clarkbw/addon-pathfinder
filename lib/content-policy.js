'use strict';

const { Cc, Ci } = require("chrome");
const xpcom = require("xpcom");

const { Class } = require('sdk/core/heritage');
const CP_NS = require('sdk/core/namespace').ns();
const { when: unload } = require('unload');
const { URL } = require('url');

const CM = Cc["@mozilla.org/categorymanager;1"]
    .getService(Ci.nsICategoryManager);

const ACCEPT = exports.ACCEPT = Ci.nsIContentPolicy.ACCEPT;
const REJECT = exports.REJECT = Ci.nsIContentPolicy.REJECT_REQUEST;

const accept = function() ACCEPT;

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
    CP_NS(self).options = options;
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

    CM.addCategoryEntry("content-policy", options.entry, factory.contract, false, true);
    unload(this.destroy.bind(this));
  },
  destroy: function() {
    // already destroyed?
    if (!CP_NS(this).options)
      return;

    CM.deleteCategoryEntry("content-policy", CP_NS(this).options.entry, false);
    CP_NS(this).options = null;
  }
});
