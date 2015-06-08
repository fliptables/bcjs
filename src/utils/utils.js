define(function () {

  var root = window;
  var DATA_ATTR_PTRN = /^data-bc-/;
  var apiAttribute = 'data-bc-api';

  function gatherSettings(ele) {
    var settings = {};
    var key;

    for (var att, i = 0, atts = ele.attributes, n = atts.length; i < n; i++){
      att = atts[i];
      if(DATA_ATTR_PTRN.test(att.nodeName)) {
        key = att.nodeName.replace(DATA_ATTR_PTRN, '');
        settings[key] = att.value || true;
      }
    }

    return settings;
  }

  function findScriptTag() {
    var scripts = root.document.getElementsByTagName('script');
    var count = scripts.length;
    var script;
    while(count--) {
      script = scripts[count];
      if(script.hasAttribute(apiAttribute)) {
        return script;
      }
    }
  }

  return {
    findScriptTag: findScriptTag,
    gatherSettings: gatherSettings,
    /*
     * A polling function which will do some work and wait some amount of time
     * before trying to do work again.
     *
     * When invoking `fn` if true was returned then something was done and we
     * might have waited too long so we halve the current wait time.
     *
     * If `fn` returns false we tried to do work too early and we will wait
     * twice as long before trying again.
     *
     * @param {Number} minWait - a multiple of 2 which is the minimum wait
     * time in ms.
     * @param {Number} maxWait - a multiple of 2 which is the max wait time in
     * ms.
     * @param {Function} fn - function which does something must return true or
     * false
     *
     * @returns {
     *  stop: function,
     *  sart: function
     * }
     */
    polling: function (minWait, maxWait, fn) {

      var wait = minWait;
      var shouldStop = false;

      if(minWait % 2 !== 0 || maxWait %2 !== 0) {
        throw new TypeError('minWait and maxWait must be multiples of 2');
      }

      function doThing() {
        var didStuff;

        if(shouldStop) {
          return;
        }

        didStuff = fn();

        if(didStuff) {
          wait = Math.max(minWait, wait / 2);
        } else {
          wait = Math.min(maxWait, wait * 2);
        }

        setTimeout(doThing, wait);
      }

      return {
        start: doThing,
        stop: function () {
          shouldStop = true;
        }
      };

    }
  };

});

