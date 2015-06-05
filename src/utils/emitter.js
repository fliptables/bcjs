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
      var subscribers = this._topics[topic] || [];
      subscribers.push(handler);
      this._topics[topic] = subscribers;
    },
    off: function (topic, handler) {
      var topics = this._topics[topic];
      _.remove(topics, function (h) {
        return h === handler;
      });
    },
    emit: function (topic) {

      var subscribers = this._topics[topic];
      var args = _.toArray(arguments).slice(1);

      _.each(subscribers, function (handler) {
        invokeHandler(handler, args);
      });

    }
  };

  return function () {
    return new Emitter();
  };

});

