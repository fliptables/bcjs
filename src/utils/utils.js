define(function (require) {

  var root = window;
  var DATA_ATTR_PTRN = /^data-bc-/;
  var apiAttribute = 'data-bc-api';
  var settings = require('./settings');
  //DATAMORPHER
  //This thing will take data from BC, and make it useable for the charts
  function bcDataMorph(originalData){

    var hideAvgUntilRating = true;
    var avgFillColor;
    var avgStrokeColor;
    var avgPointColor;
    var avgPointStroke;
    var avgPointHighlightFill;
    var avgPointHighlightStroke;
    var transparent = 'rgba(0,0,0,0)';

    if (hideAvgUntilRating) {
      avgFillColor = transparent;
      avgStrokeColor = transparent;
      avgPointColor = transparent;
      avgPointStroke = transparent;
      avgPointHighlightFill = transparent;
      avgPointHighlightStroke = transparent;
    } else {
      avgFillColor = settings.avgShape.fillColor;
      avgStrokeColor = settings.avgShape.strokeColor;
      avgPointColor = settings.avgShape.pointColor;
      avgPointStroke = settings.avgShape.pointStrokeColor;
      avgPointHighlightFill = settings.avgShape.pointHighlightFill;
      avgPointHighlightStroke = settings.avgShape.pointHighlightStroke;
    }

    //Instantiate the datasets, with the item avg
    var dataSets = [
      {
        label: 'Item Average',
        fillColor: avgFillColor,
        strokeColor: avgStrokeColor,
        pointColor: avgPointColor,
        pointStrokeColor: avgPointStroke,
        pointHighlightFill: avgPointHighlightFill,
        pointHighlightStroke: avgPointHighlightStroke,
        data: [
          parseFloat(originalData.m1),
          parseFloat(originalData.m2),
          parseFloat(originalData.m3),
          parseFloat(originalData.m4),
          parseFloat(originalData.m5)
          ]
      }
    ];

    var userRating = {
      label: 'User Rating',
      fillColor: settings.userShape.fillColor,
      strokeColor: settings.userShape.strokeColor,
      pointColor: settings.userShape.pointColor,
      pointStrokeColor: settings.userShape.pointStrokeColor,
      pointHighlightFill: settings.userShape.pointHighlightFill,
      pointHighlightStroke: settings.userShape.pointHighlightStroke
    };

    //If there is a user defined
    //and a rating include it
    //If there is no rating, set the user raitng to zeros
    if (originalData.u1) {
      userRating.data = [
        parseFloat(originalData.u1),
        parseFloat(originalData.u2),
        parseFloat(originalData.u3),
        parseFloat(originalData.u4),
        parseFloat(originalData.u5)
      ];
      dataSets.push(userRating);
    } //else if (Chart.helpers.currentUser) {
      //userRating.data = [1.5,1.5,1.5,1.5,1.5];
      //dataSets.push(userRating);
    //}

    return {
      labels: [],
      datasets: dataSets
    };
  }

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
    convertData: bcDataMorph
  };

});

