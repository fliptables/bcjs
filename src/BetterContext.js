define(function (require) {

  var utils = require('utils/utils');
  var script = utils.findScriptTag();
  var _ = require('lodash');
  var autoRender = require('autoRender');
  var tasks = window.BetterContext || [];
  var api;
  var settings;

  if(!script) {
    return;
  }

  settings = utils.gatherSettings(script);
  settings.wait = 3000;

  if(settings.auto) {
    api = autoRender.render(settings);
  }

  function scan() {
    autoRender.render(settings);
  }

  window.BetterContext = {
    push: runTask,
    scan: scan,
    ready: function (fn) {
      fn();
    },
    on: function (topic, listener) {
      api.on(topic, listener);
    },
    off: function (topic, listener) {
      api.off(topic, listener);
    }
  };

  function runTask(command) {
    var task = command[0];
    if(window.BetterContext[task]) {
      window.BetterContext[task].apply(window.BetterContext, command.slice(1));
    }
  }

  _.each(tasks, runTask);

});

