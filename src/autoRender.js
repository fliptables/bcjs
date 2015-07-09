define(function (require) {
  var emitter = require('utils/emitter')();
  var utils = require('utils/utils');
  var DataStore = require('utils/dataStore');
  var _ = require('lodash');
  var pentagon = require('./charts/pentagon');

  function renderChart(ele, globalSettings, dataStore) {
    var settings = utils.gatherSettings(ele);
    settings = _.merge(_.clone(globalSettings), settings);

    if(settings.chart === true) {
      pentagon(ele, settings, dataStore, emitter);
    } else {
      console.log('unknown chart');
    }

  }

  return {
    _getElements: function (specificSelector) {
      var notRendered = '*[data-bc-chart]:not(.rendered)';
      specificSelector = specificSelector ? specificSelector +','+ notRendered  : notRendered;
      return document.querySelectorAll(specificSelector);
    },
    renderNew: function (settings) {

      var eles = this._getElements();

      if(eles.length) {
        this._render(eles, settings);
        return true;
      } else {
        return false;
      }

    },
    _render: function (eles, settings) {
      var dataStore = new DataStore(settings);
      _.each(eles, function (ele) {
        ele.classList.add('rendered');
        renderChart(ele, settings, dataStore, emitter);
      });
    },
    render: function (settings, specificSelector) {
      var eles = this._getElements(specificSelector);
      this._render(eles, settings);
      return emitter;
    }
  };
});

