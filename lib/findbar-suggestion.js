'use strict';

const winUtils = require('window-utils');
const { Class } = require('heritage');
const { validateOptions } = require('api-utils');
const { isBrowser } = require('api-utils/window/utils');
const { unload } = require('unload+');
const { listen } = require('listen');

const findsuggestionNS = require('namespace').ns();
const NS_XUL = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

function FindSuggestionOptions(options) {
  return validateOptions(options, {
    word: { is: ['string'] },
    onClick: { is: ['undefined', 'function'] }
  });
}

const FindSuggestion = Class({
  initialize: function(options) {
    options = findsuggestionNS(this).options = FindSuggestionOptions(options);
    let unloaders = findsuggestionNS(this).unloaders = [];

    winUtils.WindowTracker({
      onTrack: function(window) {
        let findBar = window.gFindBar;
        let findContainer = findBar.getElement('findbar-container');

        // Provide a callback to handle clicks that recursively suggests
        function suggestionClick() {
          options.onClick || options.onClick();
        }

        // Show these suggestions in the findbar
        let ele = window.document.createElementNS(NS_XUL, 'label');
        ele.setAttribute('value', options.word);
        ele.style.margin = '2px';
        ele.style.cursor = 'pointer';
        ele.style.fontWeight = 'bold';
        findContainer.appendChild(ele);

        // Fill in the word when clicking on it
        ele.addEventListener('click', suggestionClick, false);

        // Clear out the suggestions when removing the add-on
        function clearSuggestion() {
          findContainer.removeChild(ele);
        }
        let remover = unload(clearSuggestion, window);

        // save a destroyer
        unloaders.push(function destroyFindbarSuggestion() {
          clearSuggestion();
          remover();
        });
      }
    });
  },
  destroy: function() {
    findsuggestionNS(this).unloaders.forEach(function(unloader) {
      unloader();
    });
  }
});
exports.FindSuggestion = FindSuggestion;
