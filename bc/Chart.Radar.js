(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	Chart.Type.extend({
		name: "Radar",
		defaults:{
			//Boolean - Whether to show lines for each scale point
			scaleShowLine : true,

			//Boolean - Whether we show the angle lines out of the radar
			angleShowLineOut : false,

			//Boolean - Whether to show labels on the scale
			scaleShowLabels : false,

			// Boolean - Whether the scale should begin at zero
			scaleBeginAtZero : true,

			//String - Colour of the angle line
			angleLineColor : "white",

			//Number - Pixel width of the angle line
			angleLineWidth : 1,

			//String - Point label font declaration
			pointLabelFontFamily : "'Arial'",

			//String - Point label font weight
			pointLabelFontStyle : "normal",

			//Number - Point label font size in pixels
			pointLabelFontSize : 10,

			//String - Point label font colour
			pointLabelFontColor : "#666",

			//Boolean - Whether to show a dot for each point
			pointDot : true,

			//Number - Radius of each point dot in pixels
			pointDotRadius : 5,

			//Number - Pixel width of point dot stroke
			pointDotStrokeWidth : 3,

			//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
			pointHitDetectionRadius : 20,

			//Boolean - Whether to show a stroke for datasets
			datasetStroke : true,

			//Number - Pixel width of dataset stroke
			datasetStrokeWidth : 2,

			//Boolean - Whether to fill the dataset with a colour
			datasetFill : true,

			//String - A legend template
			legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

		},

		initialize: function(data){
			this.PointClass = Chart.Point.extend({
				strokeWidth : this.options.pointDotStrokeWidth,
				radius : this.options.pointDotRadius,
				display: this.options.pointDot,
				hitDetectionRadius : this.options.pointHitDetectionRadius,
				ctx : this.chart.ctx
			});

			this.datasets = [];

			this.buildScale(data);

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activePointsCollection = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];

					this.eachPoints(function(point){
						point.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activePointsCollection, function(activePoint){
						activePoint.fillColor = activePoint.highlightFill;
						activePoint.strokeColor = activePoint.highlightStroke;
					});

					this.showTooltip(activePointsCollection);
				});
			}

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset){

				var datasetObject = {
					label: dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					pointColor : dataset.pointColor,
					pointStrokeColor : dataset.pointStrokeColor,
					points : []
				};

				this.datasets.push(datasetObject);

				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					var pointPosition;
					if (!this.scale.animation){
						pointPosition = this.scale.getPointPosition(index, this.scale.calculateCenterOffset(dataPoint));
					}
					datasetObject.points.push(new this.PointClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						x: (this.options.animation) ? this.scale.xCenter : pointPosition.x,
						y: (this.options.animation) ? this.scale.yCenter : pointPosition.y,
						strokeColor : dataset.pointStrokeColor,
						fillColor : dataset.pointColor,
						highlightFill : dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
					}));
				},this);

			},this);

			this.render();
		},
		eachPoints : function(callback){
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,callback,this);
			},this);
		},

		getPointsAtEvent : function(evt){
			var mousePosition = helpers.getRelativePosition(evt),
				fromCenter = helpers.getAngleFromPoint({
					x: this.scale.xCenter,
					y: this.scale.yCenter
				}, mousePosition);

			var anglePerIndex = (Math.PI * 2) /this.scale.valuesCount,
				pointIndex = Math.round((fromCenter.angle - Math.PI * 1.5) / anglePerIndex),
				activePointsCollection = [];

			// If we're at the top, make the pointIndex 0 to get the first of the array.
			if (pointIndex >= this.scale.valuesCount || pointIndex < 0){
				pointIndex = 0;
			}
			if (fromCenter.distance <= this.scale.drawingArea){
				helpers.each(this.datasets, function(dataset){
					activePointsCollection.push(dataset.points[pointIndex]);
				});
			}

			return activePointsCollection;
		},

		buildScale : function(data){
			this.scale = new Chart.RadialScale({
				display: this.options.showScale,
				fontStyle: this.options.scaleFontStyle,
				fontSize: this.options.scaleFontSize,
				fontFamily: this.options.scaleFontFamily,
				fontColor: this.options.scaleFontColor,
				showLabels: this.options.scaleShowLabels,
				showLabelBackdrop: this.options.scaleShowLabelBackdrop,
				backdropColor: this.options.scaleBackdropColor,
				backdropPaddingY : this.options.scaleBackdropPaddingY,
				backdropPaddingX: this.options.scaleBackdropPaddingX,
				lineWidth: (this.options.scaleShowLine) ? this.options.scaleLineWidth : 0,
				lineColor: this.options.scaleLineColor,
				angleLineColor : this.options.angleLineColor,
				angleLineWidth : (this.options.angleShowLineOut) ? this.options.angleLineWidth : 0,
				// Point labels at the edge of each line
				pointLabelFontColor : this.options.pointLabelFontColor,
				pointLabelFontSize : this.options.pointLabelFontSize,
				pointLabelFontFamily : this.options.pointLabelFontFamily,
				pointLabelFontStyle : this.options.pointLabelFontStyle,
				height : this.chart.height,
				width: this.chart.width,
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2,
				ctx : this.chart.ctx,
				templateString: this.options.scaleLabel,
				labels: data.labels,
				valuesCount: data.datasets[0].data.length
			});

			this.scale.setScaleSize();
			this.updateScaleRange(data.datasets);
			this.scale.buildYLabels();
		},
		updateScaleRange: function(datasets){
			var valuesArray = (function(){
				var totalDataArray = [];
				helpers.each(datasets,function(dataset){
					if (dataset.data){
						totalDataArray = totalDataArray.concat(dataset.data);
					}
					else {
						helpers.each(dataset.points, function(point){
							totalDataArray.push(point.value);
						});
					}
				});
				return totalDataArray;
			})();


			var scaleSizes = (this.options.scaleOverride) ?
				{
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				} :
				helpers.calculateScaleRange(
					valuesArray,
					helpers.min([this.chart.width, this.chart.height])/2,
					this.options.scaleFontSize,
					this.options.scaleBeginAtZero,
					this.options.scaleIntegersOnly
				);

			helpers.extend(
				this.scale,
				scaleSizes
			);

		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets
			this.scale.valuesCount++;
			helpers.each(valuesArray,function(value,datasetIndex){
				var pointPosition = this.scale.getPointPosition(this.scale.valuesCount, this.scale.calculateCenterOffset(value));
				this.datasets[datasetIndex].points.push(new this.PointClass({
					value : value,
					label : label,
					x: pointPosition.x,
					y: pointPosition.y,
					strokeColor : this.datasets[datasetIndex].pointStrokeColor,
					fillColor : this.datasets[datasetIndex].pointColor
				}));
			},this);

			this.scale.labels.push(label);

			this.reflow();

			this.update();
		},
		removeData : function(){
			this.scale.valuesCount--;
			this.scale.labels.shift();
			helpers.each(this.datasets,function(dataset){
				dataset.points.shift();
			},this);
			this.reflow();
			this.update();
		},
		update : function(){
			this.eachPoints(function(point){
				point.save();
			});
			this.reflow();
			this.render();
		},
		reflow: function(){
			helpers.extend(this.scale, {
				width : this.chart.width,
				height: this.chart.height,
				size : helpers.min([this.chart.width, this.chart.height]),
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2
			});
			this.updateScaleRange(this.datasets);
			this.scale.setScaleSize();
			this.scale.buildYLabels();
		},
		draw : function(ease){
			var easeDecimal = ease || 1,
				ctx = this.chart.ctx;
			this.clear();
			this.scale.draw();

			helpers.each(this.datasets,function(dataset){

				//Transition each point first so that the line and point drawing isn't out of sync
				helpers.each(dataset.points,function(point,index){
					if (point.hasValue()){
						point.transition(this.scale.getPointPosition(index, this.scale.calculateCenterOffset(point.value)), easeDecimal);
					}
				},this);

				//Draw the line between all the points
				ctx.lineWidth = this.options.datasetStrokeWidth;
				ctx.strokeStyle = dataset.strokeColor;
				ctx.beginPath();
				helpers.each(dataset.points,function(point,index){
					if (index === 0){
						ctx.moveTo(point.x,point.y);
					}
					else{
						ctx.lineTo(point.x,point.y);
					}
				},this);
				ctx.closePath();
				ctx.stroke();

				ctx.fillStyle = dataset.fillColor;
				ctx.fill();

				//Now draw the points over the line
				//A little inefficient double looping, but better than the line
				//lagging behind the point positions
				helpers.each(dataset.points,function(point){
					if (point.hasValue()){
						point.draw();
					}
				});

			},this);

		}

	});

}).call(this);

//This is the BC API, these
//are the callbacks that sites can use
var BCAPI = {
	itemSaved: false
};

Chart.types.Radar.extend({
	name:'BetterContext',
	defaults: {
		tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value.toFixed(1) %>",
		multiTooltipTemplate: "<%= value.toFixed(1) %>",
		scaleOverride: true,
		scaleSteps: 10,
		scaleStepWidth: 1,
		scaleStartValue: 0
	},
	initialize: function(data){
		var me = this;
		me.mouseDown = 0;
		me.activeBcPoint; //Clicked point
		me.singleValueTimer; //We use this to see if we should send a request to BC after a single item is updated

		//Declared here for reference to chart instance... might not work with
		//multi charts
		Chart.helpers.renderSaveImg = function() {
			(function() {
				me.chart.ctx.drawImage(me.saveIcon, (me.scale.xCenter-35), (me.scale.yCenter-35), 70, 70);
			})();
		};

		//Update the chart if we have
		//a selected point
		function reDraw(e){
			if (me.activeBcPoint){
				var scale = me.scale;
				var x1 = scale.xCenter+me.chart.canvas.offsetLeft;
				var y1 = scale.yCenter+me.chart.canvas.offsetTop;
				var x2 = e.pageX;
				var y2 = e.pageY;
				var newDist = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1, 2));
				var pixelPerNumber = (scale.drawingArea)/(scale.max - scale.min);
				var newVal = (newDist/pixelPerNumber);
				if (newVal >= 9.7) {
					me.activeBcPoint.value = 10;
					newVal = 10;
				}
				else if (newVal < 0.8) {
					me.activeBcPoint.value = 0;
					newVal = 0;
				}
				else {
					me.activeBcPoint.value = newVal;
				}
				//Update stored metric value for request
				me.labels[me.activeBcPoint.label].metricValue = newVal.toFixed(2);

				me.update();
			}
		}

		//Giving the user 3 seconds to take another
		//action before we send data to BC
		function startBcUpdate(label) {
			//Reset timer every time an click occurs
			window.clearTimeout(me.singleValueTimer);
			me.singleValueTimer = setTimeout(function(){
				sendUpdate();
				if (BCAPI.itemSaved) {
					window.bcItemSaved(me.chart.canvas);
				}
			}, 3000);
		}

		//Ajax request to BC, posting an update to the user rating
		function sendUpdate(){
			if (Chart.helpers.currentUser) {
				var params = 'site_id='+Chart.helpers.siteId+'&item_id='+me.bcItemId+'&user_id='+Chart.helpers.currentUser;
				Chart.helpers.each(me.labels, function(value){
					params += '&rating[]='+value.metricValue;
				});
				var postUrl = '//www.bettercontext.com/api/user_ratings';
				var request = new XMLHttpRequest();
				request.open('POST', postUrl, true);
				request.onreadystatechange = function() {
					if (request.readyState==4) {
						Chart.helpers.renderSaveImg();
					}
				};
				request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				request.send(params);
			}
		}

		//Returns the better context
		//local chart id, which matches
		//the key in bcCharts
		function whichChart() {
			return me.bcId;
		}

		//Event listeners
		me.chart.canvas.onmousedown = function(e) {
			me.mouseDown++;
			if (Chart.helpers.currentUser) {
				var selectedChart = {};
				var closePoints;

				selectedChart = Chart.helpers.bcCharts[whichChart()];
				closePoints = selectedChart.getPointsAtEvent(e);

				Chart.helpers.each(closePoints, function(val) {
					if (val.datasetLabel === "User Rating") {
						me.activeBcPoint = val;
					}
				});

				reDraw(e);
			}
		}
		me.chart.canvas.onmouseup = function(e) {
			me.mouseDown--;
			if (me.activeBcPoint) {
				me.options.animation = true;
				reDraw(e);
				startBcUpdate();
				me.activeBcPoint = undefined;
			}
		}
		me.chart.canvas.onmousemove = function(e) {
			if(me.mouseDown && me.activeBcPoint){
				me.options.animation = false;
				reDraw(e);
			}
		}
		Chart.types.Radar.prototype.initialize.apply(this, arguments);
	}
});

//Find charts
//Get data
window.onload = function(){

	//Checking if the page utilizes the API
	(function initializeBctxtApi(){
		if (window.bcItemSaved) {
			BCAPI.itemSaved = true;
		}
	})();

	//All charts on the page
	var allCharts = document.getElementsByClassName('bc_chart');

	//Determine current user
	Chart.helpers.each(allCharts, function(val) {
		if (!Chart.helpers.currentUser && val.getAttribute('data-user')) {
			Chart.helpers.currentUser = val.getAttribute('data-user');
		}
	});

	//Create a helper to store all the charts owned by bc
	Chart.helpers.bcCharts = {};

	//Create the query we're going to make our JSONP
	//request with
	var bcQuery = function(){
		if (!Chart.helpers.siteId) {
			Chart.helpers.siteId = document.getElementById('bctxtScript').getAttribute('data-account');
		}
		var query = '/api/item_ratings?site_id='+Chart.helpers.siteId;
		if (Chart.helpers.currentUser) {
			query+=('&user_id='+Chart.helpers.currentUser);
		}
		Chart.helpers.each(allCharts, function(value, index){
			//Get the bc item id of the current chart
			var itemId = value.getAttribute('data-item');
			query+=('&items[]='+itemId);
		});
		return query;
	};

	//Make our inital request
	(function makeBcInitRequest(){

		var script = document.createElement('script');
		script.src = '//bettercontext.com'+bcQuery();

		//Send Request
		document.getElementsByTagName('head')[0].appendChild(script);
		// or document.head.appendChild(script) in modern browsers

	})();

	function bcDataMorph(originalData, bcLabels){
		//Instantiate the datasets, with the item avg
		var dataSets = [
			{
				label: "Item Average",
				fillColor: "rgba(220,220,220,0.2)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(220,220,220,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)",
				data: [
					parseFloat(originalData["m1"]),
					parseFloat(originalData["m2"]),
					parseFloat(originalData["m3"]),
					parseFloat(originalData["m4"]),
					parseFloat(originalData["m5"])
					]
			}
		];

		var userRating = {
			label: "User Rating",
			fillColor: "rgba(251,185,605,0.2)",
			strokeColor: "rgba(151,187,205,1)",
			pointColor: "rgba(151,187,205,1)",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "rgba(151,187,205,1)"
		};

		//If there is a user defined
		//and a rating include it
		//If there is no rating, set the user raitng to zeros
		if (Chart.helpers.currentUser && originalData["u1"]) {
			userRating.data = [
				parseFloat(originalData["u1"]),
				parseFloat(originalData["u2"]),
				parseFloat(originalData["u3"]),
				parseFloat(originalData["u4"]),
				parseFloat(originalData["u5"])
			];
			dataSets.push(userRating);
		} else if (Chart.helpers.currentUser) {
			userRating.data = [0,0,0,0,0];
			dataSets.push(userRating);
		}

		return {
			labels: bcLabels,
			datasets: dataSets
		}
	}


	//JSONP, RESPONSE HANDLER
	window.initBcCharts = function initBcCharts(bcMultiDataSets) {

		//Iterate the charts, and create new bc charts
		//for each instance
		Chart.helpers.each(allCharts, function(value, index){
			//Get the bc item id of the current chart
			var bcItemId = value.getAttribute('data-item');

			//Morph the data sent from bc, create the dataset to be used
			//making this new chart
			var bcData = bcDataMorph(bcMultiDataSets[bcItemId], bcMultiDataSets["labels"]);

			//Make the chart
			Chart.helpers.bcCharts['bcId-'+index] = new Chart(document.getElementsByClassName('bc_chart')[index].getContext("2d")).BetterContext(bcData, {
				responsive: true
			});

			//Set bc item id, as well as the chart id, for self reference in bcCharts
			Chart.helpers.bcCharts['bcId-'+index].bcItemId = bcItemId;
			Chart.helpers.bcCharts['bcId-'+index].bcId = 'bcId-'+index;

			//Set the labels on the chart
			if (Chart.helpers.currentUser) {
				Chart.helpers.bcCharts['bcId-'+index].labels = {};
				Chart.helpers.bcCharts['bcId-'+index].saveIcon = new Image();
				Chart.helpers.bcCharts['bcId-'+index].saveIcon.src = 'http://get.bettercontext.com/saved.png';
				Chart.helpers.each(bcMultiDataSets["labels"], function(label, idx){
					Chart.helpers.bcCharts['bcId-'+index].labels[label] = {};
					Chart.helpers.bcCharts['bcId-'+index].labels[label].metricPos = 'm'+(idx+1);
					Chart.helpers.bcCharts['bcId-'+index].labels[label].metricValue = bcData.datasets[1].data[idx];
				});
			}

		});
	}

}
