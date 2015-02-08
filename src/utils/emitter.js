define(function (require) {

  var _ = require('lodash');

  function invokeHandler(handler, args) {
    handler.apply(null, args);
  }

  function Emitter() {
    this._topics = {};
  }

  Emitter.prototype = {
    on: function (topic, handler) {
      var topics = this._topics[topic] = [];
      topics.push(handler);
    },
    off: function (topic, handler) {
      var topics = this._topics[topic];
      _.remove(topics, function (h) {
        return h === handler;
      });
    },
    emit: function (topic) {

      var handlers = this._topics[topic];
      var args = _.toArray(arguments).slice(1);

      _.each(handlers, function (handler) {
        invokeHandler(handler, args);
      });

    }
  };

  return function () {
    return new Emitter();
  };

});

