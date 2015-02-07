define({
	itemSaved: false,
	ratingStarted: false,
	ratingStopped: false,
	ratingValues: false,
	options: {
		defaultWaitTime: 3000,
		scaleLineColor: 'rgba(255,255,255,0.2)',
		pointLabelFontFamily : '"Open Sans", Helvetica, Arial',
		pointLabelFontStyle : 'bold',
		pointLabelFontSize : 10,
		pointLabelFontColor : '#fff'
	},
	avgShape: {
		fillColor: 'rgba(52, 73, 94,0.4)',
		strokeColor: 'rgba(41, 128, 185,0.6)',
		pointColor: 'rgba(0,0,0,0)',
		pointStrokeColor: 'rgba(0,0,0,0)',
		pointHighlightFill: 'rgba(0,0,0,0)',
		pointHighlightStroke: 'rgba(0,0,0,0)'
	},
	userShape: {
		fillColor: 'rgba(231, 76, 60,0.7)',
		strokeColor: 'rgba(241, 196, 15,1.0)',
		pointColor: 'rgba(241, 196, 15,1.0)',
		pointStrokeColor: 'rgba(236, 240, 241,1.0)',
		pointHighlightFill: 'rgba(84, 236, 206, 1)',
		pointHighlightStroke: 'rgba(22, 160, 133,1.0)'
	},
	saveImage: 'http://get.bettercontext.com/saved.png'
});
