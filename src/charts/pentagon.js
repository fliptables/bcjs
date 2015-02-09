define(function (require) {

  var Chart = require('Chart');
  var Modernizr = require('Modernizr');
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
    // this label value is important! We use this to identify draggable input
    // points
    label: 'input',
    fillColor: 'rgba(231, 76, 60,0.7)',
    pointDot : true,
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

	var transparent = 'rgba(0,0,0,0)';

  var HIDDEN_ANSWER_STYLES = {
    fillColor: transparent,
    pointDot : false,
    strokeColor: transparent,
    pointColor: transparent,
    pointStrokeColor: transparent,
    pointHighlightFill: transparent,
    pointHighlightStroke: transparent
  };

  function getInput() {
    var out = _.clone(INPUT_STYLES);
    out.data = [1, 1, 1, 1, 1];
    return out;
  }

  function getAnswers(answers) {
    var out = _.clone(HIDDEN_ANSWER_STYLES);
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
    myCanvas = myCanvas.offsetParent;

    while(myCanvas) {
      x += myCanvas.offsetLeft;
      y += myCanvas.offsetTop;
      myCanvas = myCanvas.offsetParent;
    }

    return {
      left : x,
      top : y
    };
  }

  function getMousePos(e, canvasPos) {
    var mouseX = e.clientX - canvasPos.left + window.pageXOffset;
    var mouseY = e.clientY - canvasPos.top + window.pageYOffset;
    return {
      x : mouseX,
      y : mouseY
    };
  }

  function getTouchPos(e, canvasPos) {
    var touch;
    var touchX;
    var touchY;
    if (e.touches) {
      touch = e.touches[0];
      touchX = touch.pageX - canvasPos.left + window.pageXOffset;
      touchY = touch.pageY - canvasPos.top + window.pageYOffset;
    }
    return {
      x : touchX,
      y : touchY
    };
  }

  return function (ele, settings, dataStore, emitter) {
    var options = _.merge(_.clone(DEFAULTS), settings);
    var canvas;
    var onMouseMove;
    var onTouchMove;
    var chart;
    var point;
    var dogHandle;

    function petTheDog() {
      clearTimeout(dogHandle);
      dogHandle = setTimeout(completeRating, options.wait);
      emitter.emit('timer', {
        id: options.id,
        target: chart.chart.canvas
      });
    }

    function getPointFromEvent(e) {
      var points = chart.getPointsAtEvent(e);
      point = _.find(points, function (p) {
        return p.datasetLabel === 'input';
      });
    }

    function onTouchStart(e) {
      var canvasPos = getCanvasPos(canvas);
      getPointFromEvent(e);
      canvas.addEventListener('touchmove', onTouchMove);
      redraw(getTouchPos(e, canvasPos));
      chart.options.animation = false;
      petTheDog();
      e.preventDefault();
    }

    function onTouchEnd(e) {
      canvas.removeEventListener('touchmove', onTouchMove);
      point = undefined;
      chart.options.animation = true;
      e.preventDefault();
    }

    function onMouseDown(e) {
      var canvasPos = getCanvasPos(canvas);
      getPointFromEvent(e);
      canvas.addEventListener('mousemove', onMouseMove);
      redraw(getMousePos(e, canvasPos));
      chart.options.animation = false;
      petTheDog();
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

    onTouchMove = _.debounce(function (e) {
      var canvasPos = getCanvasPos(canvas);
      petTheDog();
      redraw(getTouchPos(e, canvasPos));
      e.preventDefault();
    }, 10);

    onMouseMove = _.debounce(function (e) {
      var canvasPos = getCanvasPos(canvas);
      petTheDog();
      redraw(getMousePos(e, canvasPos));
    }, 10);

    function registerHandlers() {
      if(Modernizr.touch) {
        canvas.addEventListener('touchstart', onTouchStart);
        canvas.addEventListener('touchend', onTouchEnd);
      } else {
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseout', onMouseOut);
      }
    }

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

    function completeRating() {
      var dataset;
      var input;
      var result;
      _.each(chart.datasets, function (set) {
        if(set.label !== 'input') {
          dataset = set;
        } else {
          input = set;
        }
      });

      result = _.map(input.points, function (point) {
        return {
          label: point.label,
          value: point.value.toFixed(2)
        };
      });

      dataStore.saveRatingItem(options, result).then(function () {
        console.log('results saved');
        _.extend(dataset, ANSWER_STYLES);
        chart.update();
        emitter.emit('saved', {
          id: options.id,
          target: chart.chart.canvas,
          result: result,
          average: _.map(dataset.points, function (point) {
            return {
              label: point.label,
              value: point.value
            };
          })
        });
      }, function (err) {
        console.log('error saving');
        console.error(err);
      });
    }

    if(ele.tagName.toLowerCase() !== 'canvas') {
      canvas = document.createElement('canvas');
      ele.appendChild(canvas);
      canvas.height = ele.clientHeight;
      canvas.width = ele.clientWidth;
    } else {
      canvas = ele;
    }

    dataStore.getRatingItems(options).then(function (resp) {
      var data = buildData(resp.results, resp.labels);
      console.log(data);
      chart = new Chart(canvas.getContext('2d')).Radar(data, options);
      registerHandlers();
    }, function (err) {
      console.log('error getting data');
      console.error(err);
    });

  };

});

