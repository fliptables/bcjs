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
    gatherSettings: gatherSettings
  };

});

