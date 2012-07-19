$(function() {
	// Handler for .ready() called.
	var opt = 
	[{
		type : 'google',
	}, 
	{
		type : 'vector',
		format : 'kml',
		kml : {
			protocol : 'http',
			url : '/map/kml/',
			strategies : ['fixed', ],
		},
		selectable : true,
	},
	{
		type : 'vector',
		format : 'kml',
		kml : {
			protocol : 'http',
			url : '/map/kml/',
			strategies : ['fixed', 'refresh'],
		},
		selectable : true,
	},];
	
	var lonlat = [77.611195, 12.940523];
	
	// Create maps
	y = $('#map').logicstick({
		layers : opt,
		center : {zoom : 13, position : lonlat},
	});
		
	//start plugin
	x = $('#ifeature').featureinfo({
		map : '#map',
		title : 'google',
		contents : function(feature){
			return '<div><h3>'+ feature.data.name+'</h3><p>'+ feature.data.description+'</p></div>'
		},
	})
});