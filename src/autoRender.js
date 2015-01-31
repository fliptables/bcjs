define(function (require) {

  var emitter = require('utils/emitter')();

  return {
    render: function (settings) {
      console.log(settings);
      return emitter;
    }
  };
});

