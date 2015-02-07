define(function (require) {

  var Chart = require('Chart');
  var _ = require('lodash');
  var DEFAULTS = {
    scaleOverride: true,
    scaleSteps: 10,
    scaleStepWidth: 1,
    scaleShowLine : true,
    angleShowLineOut : false,
    scaleShowLabels : false,
    scaleBeginAtZero : true,
    angleLineColor : 'white',
    pointLabelFontFamily : 'Arial',
    pointLabelFontStyle : 'normal',
    pointLabelFontSize : 12,
    pointLabelFontColor : '#666',
    pointDot : true,
    pointDotRadius : 5,
    pointDotStrokeWidth : 3,
    pointHitDetectionRadius : 10,
    datasetStroke : true,
    datasetStrokeWidth : 2,
    tooltipTemplate: ' ',
    customTooltips: _.noop,
    scaleLineColor: 'rgba(255,255,255,0.2)',
    datasetFill : true
  };

  var INPUT_STYLES = {
    fillColor: 'rgba(231, 76, 60,0.7)',
    strokeColor: 'rgba(241, 196, 15,1.0)',
    pointColor: 'rgba(241, 196, 15,1.0)',
    pointStrokeColor: 'rgba(236, 240, 241,1.0)',
    pointHighlightFill: 'rgba(84, 236, 206, 1)',
    pointHighlightStroke: 'rgba(22, 160, 133,1.0)',
    scaleLineColor: 'rgba(255,255,255,0.2)',
    pointLabelFontFamily : '"Open Sans", Helvetica, Arial',
    pointLabelFontStyle : 'bold',
    pointLabelFontSize : 10,
    pointLabelFontColor : '#fff'
  };

  var ANSWER_STYLES = {
		fillColor: 'rgba(52, 73, 94,0.4)',
		strokeColor: 'rgba(41, 128, 185,0.6)',
		pointColor: 'rgba(0,0,0,0)',
		pointStrokeColor: 'rgba(0,0,0,0)',
		pointHighlightFill: 'rgba(0,0,0,0)',
		pointHighlightStroke: 'rgba(0,0,0,0)',
    scaleLineColor: 'rgba(255,255,255,0.2)',
    pointLabelFontFamily : '"Open Sans", Helvetica, Arial',
    pointLabelFontStyle : 'bold',
    pointLabelFontSize : 10,
    pointLabelFontColor : '#fff'
  };

  function getInput() {
    var out = _.clone(INPUT_STYLES);
    out.data = [1, 1, 1, 1, 1];
    return out;
  }

  function getAnswers(answers) {
    var out = _.clone(ANSWER_STYLES);
    out.data = _.values(answers);
    return out;
  }

  function buildData(answers, labels) {
    return {
      labels: _.values(labels),
      datasets: [
        getAnswers(answers),
        getInput()
      ]
    };
  }

  function getCanvasPos(myCanvas) {
    var x = myCanvas.offsetLeft;
    var y = myCanvas.offsetTop;

    while(myCanvas = myCanvas.offsetParent) {
      x += myCanvas.offsetLeft - myCanvas.scrollLeft;
      y += myCanvas.offsetTop - myCanvas.scrollTop;
    }

    return {
      left : x,
      top : y
    };
  }

  /*
   * TODO when we implement a touch device we need to implement a function
   * which can give us x and y relative to the top left of the canvas object.
   */
  function getMousePos(e, canvasPos) {
    var mouseX = e.clientX - canvasPos.left + window.pageXOffset;
    var mouseY = e.clientY - canvasPos.top + window.pageYOffset;
    return {
      x : mouseX,
      y : mouseY
    };
  }

  return function (ele, settings, dataStore) {
    var canvas;
    var onMouseMove;
    var chart;
    var point;

    function redraw(pos) {
      if(!point) {
        return;
      }

      var scale = chart.scale;
      var x1 = scale.xCenter;
      var y1 = scale.yCenter;
      var x2 = pos.x;
      var y2 = pos.y;
      var newDist = Math.sqrt( (x2 -= x1) * x2 + (y2 -= y1) * y2 );
      var pixelPerNumber = (scale.drawingArea) / (scale.max - scale.min);
      var newVal = (newDist / pixelPerNumber);

      if (newVal >= 9.7) {
        point.value = 10;
      } else if (newVal < 0.8) {
        point.value = 0;
      }
      else {
        point.value = newVal;
      }
      chart.update();
    }

    function onMouseDown(e) {
      var canvasPos = getCanvasPos(canvas);
      canvas.addEventListener('mousemove', onMouseMove);
      point = chart.getPointsAtEvent(e)[0];
      redraw(getMousePos(e, canvasPos));
      chart.options.animation = false;
    }

    function onMouseUp() {
      canvas.removeEventListener('mousemove', onMouseMove);
      point = undefined;
      chart.options.animation = true;
    }

    function onMouseOut() {
      canvas.removeEventListener('mousemove', onMouseMove);
      point = undefined;
      chart.options.animation = true;
    }

    onMouseMove = _.debounce(function (e) {
      var canvasPos = getCanvasPos(canvas);
      redraw(getMousePos(e, canvasPos));
    }, 10);

    if(ele.tagName.toLowerCase() !== 'canvas') {
      canvas = document.createElement('canvas');
      ele.appendChild(canvas);
      canvas.height = ele.clientHeight;
      canvas.width = ele.clientWidth;
    } else {
      canvas = ele;
    }

    var options = _.merge(_.clone(DEFAULTS), settings);
    dataStore.getRatingItems(options).then(function (resp) {
      var data = buildData(resp.results, resp.labels);
      console.log(data);
      chart = new Chart(canvas.getContext('2d')).Radar(data, options);
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('mouseout', onMouseOut);

    }, function (err) {
      console.log('error getting data');
      console.error(err);
    });

  };

});
