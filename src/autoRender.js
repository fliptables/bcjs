define(function (require) {

  var emitter = require('utils/emitter')();
  var utils = require('utils/utils');
  var _ = require('lodash');

  function renderChart(ele) {
    var settings = utils.gatherSettings(ele);
    console.log(settings);
  }

  return {
    render: function (settings) {
      var eles = document.querySelectorAll('*[data-bc-chart]');
      _.each(eles, renderChart);
      return emitter;
    }
  };
});

