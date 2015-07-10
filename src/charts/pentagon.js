define(function (require) {

  var Chart = require('Chart');
  var Modernizr = require('Modernizr');
  var _ = require('lodash');
  var DEFAULTS = {
    scaleOverride: true,
    scaleSteps: 2,
    scaleStepWidth: 5,
    scaleShowLine : true,
    angleShowLineOut : false,
    scaleShowLabels : false,
    scaleBeginAtZero : true,
    angleLineColor : 'white',
    pointDotRadius : 3,
    pointDotStrokeWidth : 3,
    pointHitDetectionRadius : 10,
    datasetStroke : true,
    datasetStrokeWidth : 3,
    tooltipTemplate: ' ',
    customTooltips: _.noop,
    scaleLineColor: '#DCD7E0',
    datasetFill : true
  };

  //TODO We need to open this up
  //so any publisher can modify colors
  var INPUT_STYLES = {
    // this label value is important! We use this to identify draggable input
    // points
    label: 'input',
    fillColor: 'rgba(237, 29, 36, 0.2)',
    pointDot : true,
    strokeColor: 'rgba(237, 29, 36, 0.8)',
    pointColor: 'rgba(255,255,255,1)',
    pointStrokeColor: 'rgba(237, 29, 36, 1)',
    pointHighlightFill: 'rgba(237, 29, 36, 1)',
    pointHighlightStroke: '#fff',
    scaleLineColor: '#DCD7E0',
    pointLabelFontFamily : '"Open Sans", Helvetica, Arial',
    pointLabelFontStyle : 'bold',
    pointLabelFontSize : 10,
    pointLabelFontColor : '#fff'
  };

  var ANSWER_STYLES = {
    fillColor: 'rgba(91, 197, 191, 0.60)',
    strokeColor: 'rgba(0, 0, 0, 0)',
    pointColor: 'rgba(0,0,0,0)',
    pointStrokeColor: 'rgba(0,0,0,0)',
    pointHighlightFill: 'rgba(0,0,0,0)',
    pointHighlightStroke: 'rgba(0,0,0,0)',
    scaleLineColor: '#DCD7E0',
    pointLabelFontFamily : '"Open Sans", Helvetica, Arial',
    pointLabelFontStyle : 'bold',
    pointLabelFontSize : 10,
    pointLabelFontColor : '#fff'
  };

  var SECONDARY_STYLES = {
    fillColor: 'rgba(135, 117, 150, 0.3)',
    strokeColor: 'rgba(252, 255, 148, 0.0)',
    pointColor: 'rgba(0,0,0,0)',
    pointStrokeColor: 'rgba(0,0,0,0)',
    pointHighlightFill: 'rgba(0,0,0,0)',
    pointHighlightStroke: 'rgba(0,0,0,0)',
    scaleLineColor: '#DCD7E0',
    pointLabelFontFamily : '"Open Sans", Helvetica, Arial',
    pointLabelFontStyle : 'bold',
    pointLabelFontSize : 10,
    pointLabelFontColor : '#fff'
  };

	var transparent = 'rgba(0,0,0,0)';

  var HIDDEN_STYLES = {
    fillColor: transparent,
    pointDot : false,
    strokeColor: transparent,
    pointColor: transparent,
    pointStrokeColor: transparent,
    pointHighlightFill: transparent,
    pointHighlightStroke: transparent
  };

  function getInput(ratings, chartType) {
    var out;

    if (chartType === 'avg') {
      out = _.clone(HIDDEN_STYLES);
    } else {
      out = _.clone(INPUT_STYLES);
    }

    ratings = ratings || [1, 1, 1, 1, 1];
    out.data = _.values(ratings);
    return out;
  }

  function getAnswers(answers, userRating, chartType) {
    var styles;
    var out;

    //Only show average if a user rating already exists
    if (userRating || chartType === 'avg') {
      styles = ANSWER_STYLES;
    } else {
      styles = HIDDEN_STYLES;
    }

    out = _.clone(styles);
    out.data = _.values(answers);
    return out;
  }

  function getSecondaryAnswers(answers) {
    var styles;
    var out;
    styles = SECONDARY_STYLES;
    out = _.clone(styles);
    out.data = _.values(answers);
    return out;
  }

  function buildData(data, chartType) {
    var ratings = data.ratings;
    var results = data.results;
    var resultsSecondary = data.resultsSecondary;
    var labels = data.labels;
    var dataSets = [
      getAnswers(results, ratings, chartType),
      getInput(ratings, chartType)
    ];

    if (resultsSecondary) {
      dataSets = [
        getSecondaryAnswers(resultsSecondary),
        getAnswers(results, ratings, chartType)
      ];
    }

    if (chartType === 'query') {
      dataSets = [
        getInput(ratings, chartType)
      ];
    }

    return {
      labels: _.values(labels),
      datasets: dataSets
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
    if (e.touches && e.touches.length) {
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
      var cb;

      if (settings.query) {
        cb = sendQuery;
      } else {
        cb = completeRating;
      }

      clearTimeout(dogHandle);
      dogHandle = setTimeout(cb, options.wait);
      emitter.emit('timer', {
        id: options.id,
        target: chart.chart.canvas
      });
    }

    function resetPoints(e, getPosFn) {
      var canvasPos = getCanvasPos(canvas);
      // Points are highlighted by ChartJS on hover and when active
      // This will remove the highlighting and redraw the chart
      chart.eachPoints(function (p) {
        if(p.datasetLabel === 'input') {
          p.fillColor = INPUT_STYLES.pointColor;
          p.strokeColor = INPUT_STYLES.pointStrokeColor;
        }
      });
      redraw(getPosFn(e, canvasPos));
      point = undefined;
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
      resetPoints(e, getTouchPos);
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


    function onMouseUp(e) {
      resetPoints(e, getMousePos);
      chart.options.animation = true;
      if (chart.bcChartType !== 'rating') {
        canvas.removeEventListener('mousemove', onMouseMove);
      }
    }

    function onMouseOut() {
      point = undefined;
      chart.options.animation = true;
      if (chart.bcChartType === 'rating') {
        chart.datasets[0].fillColor = ANSWER_STYLES.fillColor;
        chart.update();
      } else {
        canvas.removeEventListener('mousemove', onMouseMove);
      }
    }

    onTouchMove = _.debounce(function (e) {
      var canvasPos = getCanvasPos(canvas);
      petTheDog();
      redraw(getTouchPos(e, canvasPos));
      e.preventDefault();
    }, 10);

    onMouseMove = _.debounce(function (e) {
      var canvasPos = getCanvasPos(canvas);
      if (chart.bcChartType === 'rating') {
        chart.datasets[0].fillColor = 'rgba(0,0,0,0)';
      }
      redraw(getMousePos(e, canvasPos));
    }, 10);

    function registerHandlers() {
      if(Modernizr.touch) {
        canvas.addEventListener('touchstart', onTouchStart);
        canvas.addEventListener('touchend', onTouchEnd);
      }
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('mouseout', onMouseOut);
    }

    function redraw(pos) {
      if(!point) {
        return;
      }

      if(pos.x == null || pos.y == null) {
        chart.update();
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
        //Make sure values are numbers, not strings
        point.value = parseFloat(point.value);

        return {
          label: point.label,
          value: point.value.toFixed(2)
        };
      });

      dataStore.saveRatingItem(options, result).then(function () {
        console.log('results saved');
        _.extend(dataset, ANSWER_STYLES);
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

    function sendQuery() {
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
        //Make sure values are numbers, not strings
        point.value = parseFloat(point.value);

        return {
          label: point.label,
          value: point.value.toFixed(2)
        };
      });

      dataStore.getQueriedItems(options, result).then(function (resp) {
        emitter.emit('queried', {
          id: options.id,
          target: chart.chart.canvas,
          result: result,
          items: resp
        });
      }, function (err) {
        console.log('error saving');
        console.error(err);
      });
    }

    ele.style.cursor = 'pointer';

    function insertChart(chartEle) {
      if(chartEle.tagName.toLowerCase() !== 'canvas') {
        canvas = document.createElement('canvas');
        chartEle.innerHTML = '';
        chartEle.appendChild(canvas);
        canvas.height = chartEle.clientHeight;
        canvas.width = chartEle.clientWidth;
      } else {
        canvas = chartEle;
      }
    }

    function queryChart() {
      dataStore.getLabels(options).then(function (resp) {
        initChart(resp, 'query');
        chart.bcChartType = 'query';

      }, function (err) {
        console.log('error getting data for query chart');
        console.error(err);
      });
    }

    function avgChart() {
      dataStore.getAvg(options, settings.avg).then(function (resp) {
        initChart(resp, 'avg');
        chart.bcChartType = 'avg';

      }, function (err) {
        console.log('error getting data for avg chart');
        console.error(err);
      });
    }

    function ratingChart() {
      dataStore.getRatingItems(options).then(function (resp) {
        initChart(resp, 'rating');
        chart.bcChartType = 'rating';

      }, function (err) {
        console.log('error getting data for rating chart');
        console.error(err);
      });
    }

    function initChart(resp, chartType) {
      //Only insert canvas once we have the data so user can show
      //loading animation
      insertChart(ele);

      var data = buildData(resp, chartType);
      chart = new Chart(canvas.getContext('2d')).Radar(data, options);
      registerHandlers();
    }

    //We're going to check and see what kind
    //of chart it is before we do anything else
    if (settings.query) {
      queryChart();
    } else if (settings.avg) {
      avgChart();
    } else {
      ratingChart();
    }

  };

});

