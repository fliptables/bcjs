/* The Nashty Rewrite*/

(function(){

	"use strict";

	//Declare root variable, window in the browser, global on the server
	var root = this;
	var previous = root.Chart;

	//Occupy the global variable of Chart, and create a simple base class
	var Chart = function chartFn(context){

		var chart = this;
		this.canvas = context.canvas;
		this.ctx = context;

		//Variables global to the chart
		var width = this.width = context.canvas.width;
		var height = this.height = context.canvas.height;
		this.aspectRatio = this.width / this.height;

		//High pixel density displays - multiply the size of the canvas
		//height/width by the device pixel ratio, then scale.
		helpers.retinaScale(this);

		return this;
	};

	//Globally expose the defaults to allow for user updating/changing
	//Setting properties on the Chart function
	Chart.defaults = {
		global: {
			//Boolean - animate the chart
			animation:true,

			//Number - number of animation steps
			animationSteps: 60,

			//String - animation easing effect
			animationEasing: "easeOutQuart",

			//Boolean - if we should show the scale at all
			showScale: true,

			//Boolean - if we want to override with a hard coded scale
			scaleOverride: false,

			//**Required if scaleOverride is true **
			//Number - the number of steps in a hard coded scale
			scaleSteps: null,
			//Number - the value jump in the hard caded scale
			scaleStepWidth: null
			//Number - the scale starting value
			scaleStartValue: null,

			//String - color of the scale line
			scaleLineColor: "rgba(0,0,0,0.1)",

			//Number - pixel width of the scale line
			scaleLineWidth: 1,

			//Boolean - whether to show labels on the scale
			scaleShowLabels: true,

			//Interpolated JS string - can access value
			scaleLabel: "<%=value%>",

			//Boolean - whether the scale should stick to integers, and not show any
			//floats, even if drawing space is there
			scaleIntegersOnly: true,

			//Boolean - whether the scale should start at zero, or an order of
			//magnitude down from the lowest value
			scaleBeginAtZero:false,

			//String - scale label font declaration for the scale label
			scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			//Number - scale label font size in pixels
			scaleFontSize:12,

			//String - scale label font weight style
			scaleFontStyle: "normal",

			//String - scale label font color
			scaleFontColor: "#666",

			//Boolean - whether or not the chart should be responsive and resize when
			//the browser does
			responsive: false,

			//Boolean - whether to maintain the starting aspect ratio or not when
			//responsive, if set to false, will take up entire container
			maintainAspectRatio: true,

			//Boolean - determins whether to draw tooltips on the canvas or not -
			//attaches event to touchmove & mousemove
			showTooltips: true,

			//Array - array of string names to attach tooltip events
			tooltipEvents: ["mousemove", "touchstart", "touchmove", "mouseout"],

			//String - tooltip background color
			tooltipFillColor: "rgba(0,0,0,0.8)",

			//String - tooltip label font declaration for the scale label
			tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			//Number - tooltip title font size in pixels
			tooltipFontSize: 14,

			//String - tooltip font weight style
			tooltipFontStyle: "normal",

			//String - tooltip label font color
			tooltipFontColor: "#fff",

			//String - tooltip title font declaration for the scale label
			tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			//Number - tootlip title font size in pixels
			tooltipTitleFontSize:14,

			//String - tooltip title font weight style
			tooltipTitleFontStyle: "bold",

			//String - tooltip title font color
			tooltipTitleFontColor: "#fff",

			//Number - pixel width of padding aroudn tooltip text
			tooltipYPadding: 6,

			//Number - pixel width of padding around tooltip text
			tooltipXPadding: 6,

			//Number - size of the caret on the tooltip
			tooltipCaretSize: 8,

			//Number - pixel radius of the tooltip border
			tooltipCornerRadius: 6,

			//Number - pixel offset from point x to tooltip edge
			tooltipXOffset: 10,

			//String - template string for single tooltips
			tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

			//String - template string for multi tooltips
			multiTooltipTemplate: "<%= value %>",

			//String - color behind the legend color black
			multiTooltipKeyBackground: "#fff",

			//Function - will fire on animation progression
			onAnimationProgress: function(){},

			//Function - will fire on animation completion
			onAnimationComplete: function(){}
		}
	};

	//Create a dictionary of chart types, to allow for extension of existing
	//types
	Chart.type = {};

	//Global Chart helpers object for utility methods and classes
	var helpers = Chart.helpers = {};

	//-- Basic JS utility methods
		//Each iterator
		var each = helpers.each = function eachFn(loopable, callback, self){
			//Slice on array, accepts an argument for which portion of the array
			//to remove, sending in 3 below, means sending in the array of all
			//arguments for this fn (including loopable, callback, self) and
			//cutting off the first 3, but storing the rest in this var
			var additionalArgs = Array.prototype.slice.call(arguments, 3);

			if (loopable){
				if (loopable.length === +loopable.length){
					var i;
					for (i=0; i<loopable.length; i++){
						callback.apply(self, [loopable[i], i].concat(additionalArgs));
					}
				}
				else{
					for (var item in loopable){
						callback.apply(self, [loopable[item], item].concat(additionalArgs));
					}
				}
			}
		};

		//Clone Fn
		var clone = helpers.clone = function cloneFn(obj){
			var objClone = {};
			each(obj, function cloneCallback(value, key){
				if (obj.hasOwnProperty(key)) objClone[key] = value;
			});
			return objClone;
		};

		//Extend
		var extend = helpers.extend = function extendFn(base){
			each(Array.prototype.slice.call(arguments, 1), function extendCallback(extensionObject) {
				each(extensionObject, function(value, key){
					if (extensionObject.hasOwnProperty(key)) base[key] = value;
				});
			});
			return base;
		};

		//Merge
		var merge = helpers.merge = function mergeFn(base, master){
			//Merge properties in left object over to a shallow clone of object
			//right.
			var args = Array.prototype.slice.call(arguments, 0);//TODO Look up this slice thing
			args.unshift({});//TODO look this up
			return extend.apply(null, args);
		};

		//indexOf
		var indexOf = helpers.indexOf = function indexOfFn(arrayToSearch, item){
			//Checking if indexOf already exists
			if (Array.prototype.indexOf){
				return arrayToSearch.indexOf(item)
			}
			else{
				for (var i = 0; i < arrayToSearch.length; i++){
					if (arrayToSearch[i] === item) return i;
				}
				return -1;
			}
		};

		//Where TODO - understand
		var where = helpers.where = function whereFn(collection, filterCallback){
			var filtered = [];

			helpers.each(collection, function(item){
				if (filterCallback(item)){
					filtered.push(item)
				}
			});

			return filtered;
		};

		//findNextWhere
		//if whatever we're looking for meets the criteria in the filterCallback,
		//and returns true, then we've found it
		var findNextWhere = helpers.findNextWhere = function findNextWhereFn(arrayToSearch, filterCallback, startIndex){
			//Default to start of the array
			if (!startIndex){
				startIndex = -1;
			}
			for (var i = startIndex + 1; i < arrayToSearch.length; i++){
				var currentItem = arrayToSearch[i];
				if (filterCallback(currentItem)){
					return currentItem;
				}
			};
		};

		//findPreviousWhere
		var findPreviousWhere = helpers.findPreviousWhere = function findPreviousWhereFn(arrayToSearch, filterCallback, startIndex){
			//default to end of the array
			if (!startIndex){
				startIndex = arrayToSearch.length;
			}
			for (var i = startIndex - 1; i >= 0; i--){
				var currentItem = arrayToSearch[i];
				if (filterCallback(currentItem)){
					return currentItem;
				}
			};
		};

		//Inherits
		//TODO - understand this sucker
		var inherits = helpers.inherits = function inheritsFn(extensions){
			//Basic js inheritence based on the model created in backbone
			var parent = this;
			var ChartElement = (extensions && extensions.hasOwnProperty("constructor")) ? extensions.constructor : function() { return parent.apply(this, arguments); };

			var Surrogate = function(){ this.constructor = ChartElement;};
			Surrogate.prototype = parent.prototype;
			ChartElement.prototype = new Surrogate();

			if (extensions) extend(ChartElement.prototype, extensions);

			ChartElement.__super__ = parent.prototype;

			return ChartElement;
		};

		//Noop
		var noop = helpers.noop = function noopFn(){};

		//UID
		var uid = helpers.uid = (function(){
			var id = 0;
			return function(){
				return "chart-" + id++;
			};
		})();

		//Warn
		//TODO understand
		var warn = helpers.warn = function warnFn(str){
			//Method for warning of errors
			if (window.console && typeof window.console.warn == "function") console.warn(str);
		};

		//AMD
		var amd = helpers.amd = (typeof define == 'function' && define.amd);

		//MATH TIME

			//isNumber
			var isNumber = helpers.isNumber = function isNumberFn(n){
				return !isNaN(parseFloat(n)) && isFinite(n);
			};

			//Max
			var max = helpers.max = function maxFn(array){
				return Math.max.apply( Math, array );
			};

			//Min
			var min = helpers.min = function minFn(array){
				return Math.min.apply( Math, array );
			};

			//Cap
			var cap = helpers.cap = function capFn(valueToCap, maxValue, minValue){
				if ( isNumber(maxValue) ) {
					if ( valueToCap > maxValue ){
						return maxValue;
					}
				}
				else if( isNumber(minValue) ){
					if ( valueToCap < minValue ){
						return minValue;
					}
				}
				return valueToCap;
			};

			//getDecimalPlaces
			var getDecimalPlaces = helpers.getDecimalPlaces = function getDecimalPlacesFn(num){
				if (num%1!==0 && isNumber(num)){
					return num.toString().split('.')[1].length;
				}
				else {
					return 0;
				}
			};

			//toRadians
			var toRadians = helpers.radians = function toRadiansFn(degrees){
				return degrees * (Math.PI/180);
			};

			//Gets the angle from vertical upright to the point about a centre
			var getAngleFromPoint = helpers.getAngleFromPoint = function getAngleFromPointFn(centerPoint, anglePoint){
				var distanceFromXCenter = anglePoint.x - centerPoint.x;
				var distanceFromYCenter = anglePoint.y - centerPoint.y;
				var radialDistranceFromCenter = Math.sqrt( distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);

				var angle = Math.PI * 2 + Math.atan2(distanceFromYCenter, distanceFromXCenter);

				//If the segment is in the top left quadrant, we need to add another
				//rotation to the angle
				if (distanceFromXCenter < 0 && distanceFromYCenter < 0){
					angle += Math.PI*2;
				}

				return {
					angle: angle,
					distance: radialDistanceFromCenter
				};
			};

			//AliasPixel
			var aliasPixel = helpers.aliasPixel = function aliasPixelFn(pixelWidth){
				return (pixelWidth % 2 === 0) ? 0 : 0.5;
			};

			//SplineCurve
			var splineCurve = helpers.splineCurve = function splineCurveFn(FirstPoint, MiddlePoint, AfterPoint, t){
				//Props to Rob Spencer at scaled innovation for his post on splining between points
				//http://scaledinnovation.com/analytics/splines/aboutSplines.html
				//TODO - read that

				var d01=Math.sqrt(Math.pow(MiddlePoint.x-FirstPoint.x,2)+Math.pow(MiddlePoint.y-FirstPoint.y,2)),
					d12=Math.sqrt(Math.pow(AfterPoint.x-MiddlePoint.x,2)+Math.pow(AfterPoint.y-MiddlePoint.y,2)),
					fa=t*d01/(d01+d12),// scaling factor for triangle Ta
					fb=t*d12/(d01+d12);
				return {
					inner : {
						x : MiddlePoint.x-fa*(AfterPoint.x-FirstPoint.x),
						y : MiddlePoint.y-fa*(AfterPoint.y-FirstPoint.y)
					},
					outer : {
						x: MiddlePoint.x+fb*(AfterPoint.x-FirstPoint.x),
						y : MiddlePoint.y+fb*(AfterPoint.y-FirstPoint.y)
					}
				};
			};

			//Calculate Order of Magnitude
			var calculateOrderOfMagnitude = helpers.calculateOrderOfMagnitude = function(val){
				return Math.floor(Math.log(val) / Math.LN10);
			};

			//Calculate scale range
			//TODO understand this
			var calculateScaleRange = helpers.calculateScaleRange = function(valuesArray, drawingSize, textSize, startFromZero, integersOnly){

				//Set a min step of two - a point at the top of the graph, and a point
				//at the base
				var minSteps = 2;
				var maxSteps = Math.floor(drawingSize/(textSize * 1.5));
				var skipFitting = (minSteps >= maxSteps);

				var maxValue = max(valuesArray);
				var minValue = min(valuesArray);

				//We need some degree of separation here to calculate the scales if all
				//the values are the same. Adding/minusing 0.5 will give us a range of
				//1
				if (maxValue === minValue){
					maxValue += 0.5;
					//so we don't end up with a graph with a negative start value if
					//we've said always start from zero
					if (minValue >= 0.5 && !startFromZero){
						minValue -= 0.5;
					}
					else{
						//Make up a whole number above the values
						maxValue += 0.5;
					}
				}

				var valueRange = Math.abs(maxValue - minValue);
				var rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange);
				var graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude);
				var graphMin = (startFromZero) ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude);
				var graphRange = graphMax - graphMin;
				var stepValue = Math.pow(10, rangeOrderOfMagnitude);
				var numberOfSteps = Math.round(graphRange / stepValue);

				//If we have more space on the graph we'll use it to give more
				//definition to the data
				while((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
					if (numberOfSteps > maxSteps){
						stepValue *=2;
						numberOfSteps = Math.round(graphRange/stepValue);
						//Don't ever deal with a decimal number of steps - cancel fitting
						//and just use the minimum number of steps
						if (numberOfSteps % 1 !== 0){
							skipFitting = true;
						}
					}
					//We can fit in double the amount of scale point on the scale
					else{
						//If the user has declared ints only, and the step value isn't a
						//decimal
						if (integersOnly && rangeOrderOfMagnitude >= 0){
							//If the user has said integers only, we need to check that
							//making the scale more granular wouldn't make it a float
							if (stepValue/2 % 1 === 0){
								stepValue /=2;
								numberOfSteps = Math.round(graphRange/stepValue);
							}
							//If it would make it a float, break out of the loop
							else{
								break;
							}
						}
						//If the scale doesn't have to be an int, make the scale more
						//granular anyway
						else{
							stepValue /=2;
							numberOfSteps = Math.round(graphRange/stepValue);
						}
					}
				}

				if (skipFitting){
					numberOfSteps = minSteps;
					stepValue = graphRange / numberOfSteps;
				}

				return {
					steps : numberOfSteps,
					stepValue : stepValue,
					min : graphMin,
					max : graphMin + (numberOfSteps * stepValue)
				};
			};

			/* jshint ignore:start */
			// blows up jshint erros based on the new Function constructor
			//Templating methods
			//Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
			//TODO WTFBBQ amirite?
			template = helpers.template = function templateFn(templateString, valuesObject){
				// If templateString is function rather than string-template - call the
				// function for values Object
				if (templateString instanceof Function){
					return templateString(valuesObject);
				}

				var cache = {};
				function tmpl(str, data){
					//Figure out if we're getting a template, or if we need to load the
					//template - and be sure to cache the result
					var fn = !/\W/.test(str) ?
					cache[str] = cache[str] :

					//Generate a reusable function that will serve as a template
					//generator (and which will be cached).
					new Function("obj",
						"var p=[],print=function(){p.push.apply(p,arguments);};" +

						//Introduce the data as local variabls using with(){}
						"with(obj){p.push('" +

						// Convert the template into pure JavaScript
						str
							.replace(/[\r\t\n]/g, " ")
							.split("<%").join("\t")
							.replace(/((^|%>)[^\t]*)'/g, "$1\r")
							.replace(/\t=(.*?)%>/g, "',$1,'")
							.split("\t").join("');")
							.split("%>").join("p.push('")
							.split("\r").join("\\'") +
						"');}return p.join('');"
					);

					//Provide some basic currying to the user
					return data ? fn( data ) : fn;
				}
				 return tmpl(templateString, valuesObject);
			};

			/* jshint ignore:end */

			//Generate labels
			//TODO labelTemplateString is never use
			//might be a legit bug!
			var generateLabels = helpers.generateLabels = function generateLabelsFn(templateString, numberOfSteps, graphMin, stepValue){
				var labelsArray = new Array(numberOfSteps);
				if (labelTemplateString){
					each(labelsArray, function(val, i){
						labelsArray[i] = template(templateString, {value: (graphMin + (stepValue*(i+1)))});
					});
				}
				return labelsArray;
			};

		//--Animation Methods
		//Easing functions adapted from Robert Penner's easing equations
		//http://www.robertpenner.com/easing/

		var easingEffects = helpers.easingEffects = {
			linear: function (t){
				return t;
			},
			easeInQuad: function (t){
				return t*t;
			},
			easeOutQuad: function (t){
				return -1 * t * (t-2);
			},
			easeInOutQuad: function (t){
				if ((t /= 1 / 2) < 1) return 1/2*t*t;
				return -1/2 * ((--t)*(t-2)-1);
			},
			easeInCubic: function (t){
				return t*t*t;
			},
			easeOutCubic: function (t) {
				return 1 * ((t = t / 1 - 1) * t * t + 1);
			},
			easeInOutCubic: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t;
				return 1 / 2 * ((t -= 2) * t * t + 2);
			},
			easeInQuart: function (t) {
				return t * t * t * t;
			},
			easeOutQuart: function (t) {
				return -1 * ((t = t / 1 - 1) * t * t * t - 1);
			},
			easeInOutQuart: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t;
				return -1 / 2 * ((t -= 2) * t * t * t - 2);
			},
			easeInQuint: function (t) {
				return 1 * (t /= 1) * t * t * t * t;
			},
			easeOutQuint: function (t) {
				return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
			},
			easeInOutQuint: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t * t;
				return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
			},
			easeInSine: function (t) {
				return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
			},
			easeOutSine: function (t) {
				return 1 * Math.sin(t / 1 * (Math.PI / 2));
			},
			easeInOutSine: function (t) {
				return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
			},
			easeInExpo: function (t) {
				return (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
			},
			easeOutExpo: function (t) {
				return (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
			},
			easeInOutExpo: function (t) {
				if (t === 0) return 0;
				if (t === 1) return 1;
				if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
				return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
			},
			easeInCirc: function (t) {
				if (t >= 1) return t;
				return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
			},
			easeOutCirc: function (t) {
				return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
			},
			easeInOutCirc: function (t) {
				if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
				return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
			},
			easeInElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1) == 1) return 1;
				if (!p) p = 1 * 0.3;
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
			},
			easeOutElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1) == 1) return 1;
				if (!p) p = 1 * 0.3;
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
			},
			easeInOutElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1 / 2) == 2) return 1;
				if (!p) p = 1 * (0.3 * 1.5);
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
				return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
			},
			easeInBack: function (t) {
				var s = 1.70158;
				return 1 * (t /= 1) * t * ((s + 1) * t - s);
			},
			easeOutBack: function (t) {
				var s = 1.70158;
				return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
			},
			easeInOutBack: function (t) {
				var s = 1.70158;
				if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
				return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
			},
			easeInBounce: function (t) {
				return 1 - easingEffects.easeOutBounce(1 - t);
			},
			easeOutBounce: function (t) {
				if ((t /= 1) < (1 / 2.75)) {
					return 1 * (7.5625 * t * t);
				} else if (t < (2 / 2.75)) {
					return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
				} else if (t < (2.5 / 2.75)) {
					return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
				} else {
					return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
				}
			},
			easeInOutBounce: function (t) {
				if (t < 1 / 2) return easingEffects.easeInBounce(t * 2) * 0.5;
				return easingEffects.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5;
			}
		};

		//Request animation polyfill - http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
		var requestAnimFrame = helpers.requestAnimFrame = (function(){
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(callback) {
					return window.setTimeout(callback, 1000 / 60);
				};
		})();

		//Cancel animation frame
		var cancelAnimFrame = helpers.cancelAnimFrame = (function(){
			return window.cancelAnimationFrame ||
				window.webkitCancelAnimationFrame ||
				window.mozCancelAnimationFrame ||
				window.oCancelAnimationFrame ||
				window.msCancelAnimationFrame ||
				function(callback) {
					return window.clearTimeout(callback, 1000 / 60);
				};
		})();

		//Animation Loop
		var animationLoop = helpers.animationLoop = function animationLoopFn(callback, totalSteps, easingString, onProgress, onComplete, chartInstance){

			var currentStep = 0;
			var easingFunction = easingEffects[easingString] || easingEffects.linear;

			var animationFrame = function animationFrameFn(){
				currentStep++;
				var stepDecimal = currentStep/totalSteps;
				var easeDecimal = easingFunction(stepDecimal);

				callback.call(chartInstance, easeDecimal, stepDecimal, currentStep);
				onProgress.call(chartInstance, easeDecimal, stepDecimal);
				if (currentStep < totalSteps){
					chartInstance.animationFrame = requestAnimFrame(animationFrame);
				} else {
					onComplete.apply(chartInstance);
				}
			};
			requestAnimFrame(animationFrame);
		};

	//-- Dom methods

		//Get relative position
		var getRelativePosition = helpers.getRelativePosition = function getRelativePositionFn(evt){
			var mouseX;
			var mouseY;
			var e = evt.originalEvent || evt;
			var canvas = evt.currentTarget || evt.srcElement;
			var boundingRect = canvas.getBoundingClientRect();

			if (e.touches){
				mouseX = e.touches[0].clientX - boundingRect.left;
				mouseY = e.touches[0].clientY - boundingRect.top;
			}
			else{
				mouseX = e.clientX - boundingRect.left;
				mouseY = e.clientY - boundingRect.top;
			}

			return {
				x: mouseX,
				y: mouseY
			}
		};

		//Add Event
		var addEvent = helpers.addEvent = function addEventFn(node, eventType, method){
			if (node.addEventListener){
				node.addEventListener(eventType, method);
			} else if (node.attachEvent){
				node.attachEvent("on"+eventType, method);
			} else {
				node["on"+eventType] = method;
			}
		};

		//Remove Event
		var removeEvent = helpers.removeEvent = function removeEventFn(node, eventType, handler){
			if (node.removeEventListener){
				node.removeEventListener(eventType, handler, false);
			} else if (node.detachEvent){
				node.detachEvent("on"+eventType, handler);
			} else {
				node["on" + eventType] = noop;
			}
		};

		//Bind Events
		var bindEvents = helpers.bindEvents = function bindEventsFn(chartInstance, arrayOfEvents, handler){
			//Create the events object if it's not already present
			if (!chartInstance.events) chartInstance.events = {};

			each(arrayOfEvents, function(eventName){
				chartInstance.events[eventName] = function(){
					handler.apply(chartInstance, arguments);
				};
				addEvent(chartInstance.chart.canvas, eventName, chartInstance.events[eventName]);
			});
		};

		//Unbind Events
		var unbindEvents = helpers.unbindEvents = function unbindEventsFn(chartInstance, arrayOfEvents) {
			each(arrayOfEvents, function(handler, eventName){
				removeEvent(chartInstance.chart.canvas, eventName, handler);
			});
		};

		//Get Maximum Width
		var getMaximumWidth = helpers.getMaximumWidth = function getMaximumWidthFn(domNode){
			var container = domNode.parentNode;
			//TODO cross browser compat?
			return container.clientWidth;
		};

		//Get Maximum Height
		var getMaximumHeight = helpers.getMaximumHeight = function getMaximumHeightFn(domNode){
			var container = domNode.parentNode;
			//TODO cross browser compat?
			return container.clientHeight;
		};

		//Get Maximum Size
		var getMaximumSize = helpers.getMaximumSize = helpers.getMaximumWidth; //Legacy support

		//Retina Scale
		var retinaScale = helpers.retinaScale = function retinaScaleFn(chart){
			var ctx = chart.ctx;
			var width = chart.canvas.width;
			var height = chart.canvas.height;

			if (window.devicePixelRatio) {
				ctx.canvas.style.width = width + "px";
				ctx.canvas.style.height = height + "px";
				ctx.canvas.height = height * window.devicePixelRatio;
				ctx.canvas.width = width * window.devicePixelRatio;
				ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
			}
		};

	//-- Canvas Methods

		//Clear
		var clear = helpers.clear = function clearFn(chart){
			chart.ctx.clearRect(0,0,chart.width,chart.height);
		};

		//Font String
		var fontString = helpers.fontString = function(pixelSize, fontStyle, fontFamily){
			return fontStyle + " " + pixelSize + "px " + fontFamily;
		};

		//Longest Text
		var longestText = helpers.longestText = function longestTextFn(ctx, font, arrayOfStrings){
			ctx.font = font;
			var longest = 0;
			each(arrayOfStrings, function(string){
				var textWidth = ctx.measureText(string).width;
				longest = (textWidth > longest) ? textWidth : longest;
			});
			return longest;
		};

		//Draw Rounded Rectangle
		var drawRoundedRectangle = helpers.drawRoundedRectangle = function(ctx, x, y, width, height, radius){
			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + width - radius, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			ctx.lineTo(x + width, y + height - radius);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			ctx.lineTo(x + radius, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
		};

	//Store a reference to each instance - allowing us to globally resize chart
	//instances on window resize. Destroy method on the chart will remove the
	//instance of the chart from this reference.
	Chart.instances = {};

	Chart.Type = function TypeFn(data, options, chart){
		this.options = options;
		this.chart = chart;
		this.id = uid();
		//Add the chart instance to the global namespace
		Chart.instances[this.id] = this;

		//Initialize is always called when a chart type is created
		//By default it is a no op, but it should be extended
		if (option.responsive){
			this.resize();
		}
		this.initialize.call(this, data);
	};

	//Core methods that'll be a part of every chart type
	extend(Chart.Type.Prototype, {
		intitialize: function(){ return this; },
		clear: function(){
			clear(this.chart);
			return this;
		},
		stop: function(){
			//Stops any current animation loop occurring
			helpers.cancelAnimFrame.call(root, this.animationFrame);
			return this;
		},
		resize: function(callback){
			this.stop();
			var canvas = this.chart.canvas;
			var newWidth = getMaximumWidth(this.chart.canvas);
			var newHeight = this.options.maintainAspectRatio ? newWidth / this.chart.aspectRatio : getMaximumHeight(this.chart.canvas);

			canvas.width = this.chart.width = newWidth;
			canvas.height = this.chart.height = newHeight;

			retinaScale(this.chart);

			if (typeof callback === "function"){function
				callback.apply(this, Array.prototype.slice.call(arguments, 1));
			}
			return this;
		},
		reflow: noop,
		render: function(reflow){
			if (reflow){
				this.reflow();
			}
			if (this.options.animation && !reflow){
				helpers.animationLoop(
					this.draw,
					this.options.animationSteps,
					this.options.animationEasing,
					this.options.onAnimationProgress,
					this.options.onAnimationComplete,
					this
				);
			}
			else {
				this.draw();
				this.options.onAnimationComplete.call(this);
			}
			return this;
		},
		generateLegend: function(){
			return template(this.options.legendTemplate, this);
		},
		destroy: function(){
			this.clear();
			unbindEvents(this, this.events);
			delete Chart.instances[this.id];
		},
		showTooltip: function(){
			//Only redraw the chart if we've actually what we're hovering
			if (typeof this.activeElements === 'undefined') this.activeElements = [];

			var isChanged = (function(Elements){
				var changed = false;

				if (Elements.length !== this.activeElements.length){
					changed = true;
					return changed;
				}

				each(Elements, function(element, index){
					if (element !== this.activeElements[index]){
						changed = true;
					}
				}, this);
				return changed;
			}).call(this, ChartElements);

			if (!isChanged && !forceRedraw){
				return;
			}
			else {
				this.activeElements = ChartElements;
			}
			this.draw();
			if (ChartElements.length > 0){
				//If we have multiple datasets, show a MultiTooltip for all of the data
				//points at that index
				if (this.datasets && this.datasets.length > 1){
					var dataArray;
					var dataIndex;

					for (var i = this.datasets.length - 1; i >= 0; i--) {
						dataArray = this.datasets[i].points || this.datasets[i].bars || this.datasets[i].segments;
						dataIndex = indexOf(dataArray, ChartElements[0]);
						if (dataIndex !== -1){
							break;
						}
					}

					var tooltipLabels = [];
					var tooltipColors = [];
					var medianPosition = (function(index) {

						//Get all the points at that particular index
						var Elements = [];
						var dataCollection;
						var xPositions = [];
						var yPositions = [];
						var xMax;
						var yMax;
						var xMin;
						var yMin;

						helpers.each(Elements, function(element) {
							dataCollection = dataset.points || dataset.bars || dataset.segments;
							if (dataCollection[dataIndex] && dataCollection[dataIndex].hasValue()){
								Elements.push(dataCollection[dataIndex]);
							}
						});

						helpers.each(Elements, function(element) {
							xPositions.push(element.x);
							yPositions.push(element.y);

							//Include any color information about the element
							tooltipLabels.push(helpers.template(this.options.multiTooltipTemplate, element));
							tooltipColors.push({
								fill: element._saved.fillColor || element.fillColor,
								stroke: element._saved.strokeColor || element.strokeColor
							});

						}, this);

						yMin = min(yPositions);
						yMax = max(yPositions);

						xMin = min(xPositions);
						xMax = max(xPositions);

						return {
							x: (xMin > this.chart.width/2) ? xMin : xMax,
							y: (yMin + yMax)/2
						};
					}).call(this, dataIndex);

					new Chart.MultiTooltip({
						x: medianPosition.x,
						y: medianPosition.y,
						xPadding: this.options.tooltipXPadding,
						yPadding: this.options.tooltipYPadding,
						xOffset: this.options.tooltipXOffset,
						fillColor: this.options.tooltipFillColor,
						textColor: this.options.tooltipFontColor,
						fontFamily: this.options.tooltipFontFamily,
						fontStyle: this.options.tooltipFontStyle,
						fontSize: this.options.tooltipFontSize,
						titleTextColor: this.options.tooltipTitleFontColor,
						titleFontFamily: this.options.tooltipTitleFontFamily,
						titleFontStyle: this.options.tooltipTitleFontStyle,
						titleFontSize: this.options.tooltipTitleFontSize,
						cornerRadius: this.options.tooltipCornerRadius,
						labels: tooltipLabels,
						legendColors: tooltipColors,
						legendColorBackground : this.options.multiTooltipKeyBackground,
						title: ChartElements[0].label,
						chart: this.chart,
						ctx: this.chart.ctx
					}).draw();

				} else {
					each(ChartElements, function(Element) {
						var tooltipPosition = Element.tooltipPosition();
						new Chart.Tooltip({
							x: Math.round(tooltipPosition.x),
							y: Math.round(tooltipPosition.y),
							xPadding: this.options.tooltipXPadding,
							yPadding: this.options.tooltipYPadding,
							fillColor: this.options.tooltipFillColor,
							textColor: this.options.tooltipFontColor,
							fontFamily: this.options.tooltipFontFamily,
							fontStyle: this.options.tooltipFontStyle,
							fontSize: this.options.tooltipFontSize,
							caretHeight: this.options.tooltipCaretSize,
							cornerRadius: this.options.tooltipCornerRadius,
							text: template(this.options.tooltipTemplate, Element),
							chart: this.chart
						}).draw();
					}, this);
				}
			}
			return this;
		},
		toBase64Image: function(){
			return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
		}
	});

	Chart.Type.extend = function(extensions){

		var parent = this;

		var ChartType = function(){
			return parent.apply(this, arguments);
		};

		//Copy the prototype obect of the this class
		ChartType.prototype = clone(parent.prototype);

		//Now overwrite some of the properties in the base class widht the new
		//extensions
		extend(ChartType.prototype, extensions);

		ChartType.extend = Chart.Type.extend;

		if (extensions.name || parent.prototype.name){

			var chartName = extensions.name || parent.prototype.name;
			//Assign any potential default values of the new chart type

			//If none are defined, we'll use a lcone of the chart type this is being
			//extended from. I.e. if we extend a line chart, we'll use the defaults
			//from the line chart if our new chart doesn't define some defaults of
			//their own.

			var baseDefaults = (Chart.defaults[parent.prototype.name]) ? clone(Chart.defauls[parent.prototype.name]) : {};

			Chart.defaults[chartName] = extend(baseDefauls, extensions.defaults);

			Chart.types[chartName] = ChartType;

			//Register this new chart type in the chart prototype
			Chart.prototype[chartName] = function(data, options){
				var config = merge(Chart.defaults.global, Chart.defaults[chartName], options || {});
				return new ChartType(data, config, this);
			};

		} else {
			warn("Name not provided for this chart, so it hasn't been registered");
		}
		return parent;
	};

	Chart.Element = function ElementFn(configuration){
		extend(this, configuration);
		this.initialize.apply(this, arguments);
		this.save();
	};







});
