<!-- contributed by Erik Vold [erikvvold@gmail.com]  -->

The `userstyles` module allows one to load css/userstyles for content or chrome
pages.

## Example ##

    require("unload").load(require("self").data.url("style.css"));

<api name="load">
@function
  Loads css/userstyles which will be automatically removed when the add-on
  unloads.

@param url {string}
  The url of a css file.

@param options {object}
  Some options for the stylesheet.

@prop type {String}
  The type for the stylesheet, there are two types 'agent' and 'user'.
  The default should be used when possible, which is 'user'.

</api>
