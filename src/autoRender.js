define(function (require) {
  var emitter = require('utils/emitter')();
  var utils = require('utils/utils');
  //var DataStore = require('utils/dataStore');
  var _ = require('lodash');
  var pentagon = require('./charts/pentagon');

  function renderChart(ele, globalSettings) {
    var settings = utils.gatherSettings(ele);
    settings = _.merge(_.clone(globalSettings), settings);

    if(settings.chart === true) {
      pentagon(ele, settings);
    } else {
      console.log('unknown chart');
    }

  }

  return {
    render: function (settings) {
      var eles = document.querySelectorAll('*[data-bc-chart]');
      //_.each(eles, function (ele) {
        renderChart(eles[0], settings);
      //});
      return emitter;
    }
  };
});

