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


});
