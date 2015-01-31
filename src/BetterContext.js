define(function (require) {

  var utils = require('utils/utils');
  var script = utils.findScriptTag();
  var autoRender = require('autoRender');
  var api;
  var settings;

  if(!script) {
    return;
  }

  settings = utils.gatherSettings(script);

  if(settings.auto) {
    api = autoRender.render(settings);
  }

  return {
    init: function (options) {

    },
    on: function (topic, listener) {
      api.on(topic, listener);
    },
    off: function (topic, listener) {
      api.off(topic, listener);
    },
    createChart: function (options) {

    }
  };

});

