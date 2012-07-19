/*
 * MapClient Class: Responsible for everything map has to offer
 */
function MapClient(options) {
	var map = {};
	var map_layer = {};
	var map_labels = {};
	
	var vector_strategy = [];
	var vector_format, vector_protocol;	
	var vector_layers = [];
	
	// 12.940523,77.611195
	var longitude = 77.611195;
	var latitude = 12.940523;
	var zoomLevel = 8;
	
	//this.createGraph = createGraph;
	this.initMap = initMap;
	this.mapType = mapType;
	this.addVectorStyle = addVectorStyle;
	this.addDynamicFeatures = addDynamicFeatures;
	this.addControlOnFeature = addControlOnFeature; 
	this.initVector = initVector;
	this.setCenter = setCenter;
	this.addPopupOnHover = addPopupOnHover; 
	this.removePopupOnFeature = removePopupOnFeature;
	
	/*
	 * initMap 
	 */
	function initMap(){
		// Create map inside map holder
		opt = {
			div: options.holder,
			controls: [],
			eventListeners: options.eventListeners,
			theme: options.theme,
			//tileSize: new OpenLayers.Size(600,600),
		};
		// Setup our map object
		map = new OpenLayers.Map(opt);
		return;
	}
	
	/*
	 * Select Map Type
	 */
	function mapType(type){
		// choose which map to produce
		if(type === "google") {
			getGoogleGraph();
		} else if(type === "other") {
			getOtherGraph();
		} else if(type === "wms") {
			getWmsGraph();
		} else if(type === "osm") {
			getOsmGraph();
		} else {
			do_nothing();
		}
	}
	
	/*
	 * Add Style for Map
	 */
	function addVectorStyle(){
		var def = [
		{
			//source
			fillColor: '${speedcolor}',
			fillOpacity: .8,
			strokeColor: '#cc0000',
			strokeWidth: 5,
			pointRadius: 3,
			//label: '${speed}',
		},
		{
			//destination
			fillColor: '${speedcolor}',
			fillOpacity: .8,
			strokeColor: '#bb0000',
			strokeWidth: 5,
			pointRadius: 3,
			//label: '${speed}',
		},
		{
			// trackpoint
			fillColor: '${speedcolor}',
			fillOpacity: .8,
			strokeColor: '#aa0000',
			strokeWidth: 1,
			pointRadius: 4,
			//label: '${speed}',
		}];
		
		var sel = [
		{
			//source
			fillColor: '${speedcolor}',
			fillOpacity: .8,
			strokeColor: '#ccbb00',
			strokeWidth: 5,
			pointRadius: 20,
			label: 'source',
		},
		{
			// destination
			fillColor: '${speedcolor}',
			fillOpacity: .8,
			strokeColor: '#bbcc00',
			strokeWidth: 5,
			pointRadius: 20,
			label: 'destination',
		},
		{
			// trackpoint
			fillColor: '${speedcolor}',
			fillOpacity: .8,
			strokeColor: '#bb0000',
			strokeWidth: 1,
			pointRadius: 6,
			//label: '${speed}',
		}];
		var temp = [
		{
			//source
			fillColor: '${speedcolor}',
			fillOpacity: .8,
			strokeColor: '#cc0000',
			strokeWidth: 5,
			pointRadius: 7,
		},
		{
			// destination
			fillColor: '${speedcolor}',
			fillOpacity: .8,
			strokeColor: '#bb0000',
			strokeWidth: 5,
			pointRadius: 7,
		},
		{
			// trackpoint
			fillColor: '${speedcolor}',
			fillOpacity: .8,
			strokeColor: '#bb0000',
			strokeWidth: 1,
			pointRadius: 6,
		}];
		
		var symbolizer_lookup_default = {
			'source' : def[0],
			'destination': def[1],
			'trackpoint': def[2],
		}
		var symbolizer_lookup_select = {
			'source' : sel[0],
			'destination': sel[1],
			'trackpoint': sel[2],
		}
		var symbolizer_lookup_temp = {
			'source' : temp[0],
			'destination': temp[1],
			'trackpoint': temp[2],
		}
		
		var vector_style_map = new OpenLayers.StyleMap({});
		vector_style_map.addUniqueValueRules('default', 'marker', symbolizer_lookup_default);
		vector_style_map.addUniqueValueRules('select', 'marker', symbolizer_lookup_select);
		vector_style_map.addUniqueValueRules('temporary', 'marker', symbolizer_lookup_temp);
		
		return vector_style_map;
	}
	
	/*
	 * 
	 */
	function addDynamicFeatures(){
		// map_option.url, map_option.protocol, map_option.format , map_option.strategy)
		console.log("[*] URL "+options.url +" protocol: "+options.protocol + " format: "+options.format+" strategy: "+options.strategy);
		
		if (options.format === "KML"){
			vector_format = new OpenLayers.Format.KML({});
		} else if(options.format === "GeoJSON"){
			vector_format = new OpenLayers.Format.GeoJSON({});
		}
		
		/*
		 * =======================================================
		 */
		var value = {
				url: options.url,
				format: vector_format,
		}
		if(options.protocol === "HTTP"){
			vector_protocol = new OpenLayers.Protocol.HTTP(value);
		} else if(options.protocol === "WFS") {
			vector_protocol = new OpenLayers.Protocol.WFS(value);
		}
			
		/*
		 * Feature of strategy
		 */
		var i = 0;
		for(i=0; i < options.strategy.length; i++){
			if (options.strategy[i] === "Refresh"){
				vector_strategy.push(new OpenLayers.Strategy.Refresh({}));	
			} else if(options.strategy[i] === "Fixed"){
				vector_strategy.push(new OpenLayers.Strategy.Fixed({}));
			}
		}
		
		return;
	}
	
	/*
	 * 
	 */
	function initVector(){
		console.log("[*] Done Loading");
		var vect_layer = new OpenLayers.Layer.Vector('Basic Vector', {
			protocol: vector_protocol,
			strategies: vector_strategy,
		});
		if (options.isStyled === true) {
			vect_layer.styleMap = this.addVectorStyle();
		}
		if (options.isControl === true){
			this.addControlOnFeature(options.controls, vect_layer);
		}
		vector_layers.push(vect_layer);
		map.addLayers(vector_layers);
		return;
	}
	
	var report = function(e) {
		console.log('[==============================================]');
     };
     
     /*
      * GEt popup
      */
     function getPopup(feature){
     	popup = new OpenLayers.Popup.FramedCloud("chicken", feature.geometry.getBounds().getCenterLonLat(),
                                     null,
                                     "<div style='font-size:.8em'>Feature: " + feature.id +"<br>Area: " + feature.attributes.speed+"</div>",
                                     null, true, function(){});
       popup.imageSrc = "/static/Trip/img/cloud-popup-relative.png"
      
	    return popup;
     }
    
    /*
     * Display a popup msg containing dynamic data
     */
    function addPopupOnHover(e){
    	console.log("[ADD POPUP]");
    	console.log(e.type + " >> "+ e.feature.attributes.name);
    	
    	if (typeof e.feature.popup === "undefined" || e.feature.popup === null){
    		popup = getPopup(e.feature);
    		e.feature.popup = popup;
        	map.addPopup(popup);
    	}
        return;
	}
	
	/*
     * remove a popup msg containing dynamic data
     */
	function removePopupOnFeature(e){
		console.log("[REMOVE POPUP]");
		console.log(e.feature.popup);
		
        if (typeof e.feature.popup != "undefined" || e.feature.popup != null) {
			map.removePopup(e.feature.popup);
        	e.feature.popup.destroy();
        	e.feature.popup = null;
		}
    	return;
	}
	
	function addSelectPopup(feature){
		console.log(feature.popup);
		if ((typeof feature.popup === "undefined") || (feature.popup === null)) {
			popup = getPopup(feature);	
			feature.popup = popup;
			map.addPopup(popup);
		}
		return;
	}
	
	function removeSelectPopup(feature){
		console.log("removing popup");
		console.log(feature.popup);
		if (typeof feature.popup != "undefined" || feature.popup != null) {
			map.removePopup(feature.popup);
			feature.popup.destroy();
			feature.popup = null;
		}
		return;
	}
	
	/*
	 * Adding control on featuers
	 */
	function addControlOnFeature(controls, vect_layer){
		var i = 0;
		var c = [];
		for(i =0; i < controls.length; i++){
			switch(controls[i]){
				case 'SelectFeature':
					c = new OpenLayers.Control.SelectFeature(vect_layer,  
					{
						multiple: false, 
						highlightOnly: true,
						hover: true,
						renderIntent: "temporary",
						eventListeners: {
							featurehighlighted: this.addPopupOnHover,
							featureunhighlighted: this.removePopupOnFeature,
							}		
					});
					var selectCtrl = new OpenLayers.Control.SelectFeature(vect_layer,
						{
							clickout: true,
							onSelect: addSelectPopup,
							onUnselect: removeSelectPopup,
						}
					);
					map.addControl(c);
					map.addControl(selectCtrl);
					c.activate();
					selectCtrl.activate();
					break;
				default:
					break;
			}
		}
		return;
	}
	
	/*
	 * createGraph : Create OSW Graph using Openlayers given object
	 */
	function createGraph(type) {
		// Create map inside map holder
		options = {
			div: this.holder,
			controls: [],
			eventListeners: {},
			theme: null,
			//tileSize: new OpenLayers.Size(600,600),
		};
		// Setup our map object
		map = new OpenLayers.Map(options);
		
		// choose which map to produce
		if(type === "google") {
			getGoogleGraph();
		} else if(type === "other") {
			getOtherGraph();
		} else if(type === "wms") {
			getWmsGraph();
		} else if(type === "osm") {
			getOsmGraph();
		} else {
			do_nothing();
		}
		//Add Vector
		//addVectors();
		otherAddVectors();
		// Center Graph :)
		_setCenter();
		
		// Get pixel from lon lat..
		console.log(map.getPixelFromLonLat(getTransform(longitude, latitude)));
		// setTimeout(function(){
			// alert('redrawing');
			// map_layer.redraw();
		// }, 4000);
		return;
	}
	
	/*
	 * Create a google version 3 graph
	 */
	function getGoogleGraph() {
		console.log("[*] Google Map");
		map_layer = new OpenLayers.Layer.Google("Google Streets", // the default
		{
			numZoomLevels : 20
		});
		
		map.addLayers([map_layer,]);
		
		return;
	}
	
	/*
	 * Create a WMS Graph
	 */
	function getWmsGraph() {
		console.log("[*] WMS Graph Map");
		
		// Setup our two layer objects
		map_layer = new OpenLayers.Layer.WMS(
			'Base layer',
			'http://vmap0.tiles.osgeo.org/wms/vmap0',
			{layers: 'basic'},
			{isBaseLayer: true}
		);
		
		map.addLayers([map_layer,]);
		return;
	}
	
	/*
	 * Create a OpenStreet Map Graph (OSM)
	 */
	function getOsmGraph() {
		console.log("[*] OSM Graph Map");
		
		// Setup our two layer objects
		map_layer = new OpenLayers.Layer.OSM({isBaseLayer: true});
		
		map.addLayers([map_layer,]);
		return;
	}

	/*
	 * Google Snippet !!
	 */
	function googleSnip() {
		console.log("[*] Google Map");
		
		map.addControl(new OpenLayers.Control.LayerSwitcher());

		var gmap = new OpenLayers.Layer.Google("Google Streets", // the default
		{
			numZoomLevels : 20
		});

		map.addLayers([gmap,]);

		// Google.v3 uses EPSG:900913 as projection, so we have to
		// transform our coordinates
		map.setCenter(new OpenLayers.LonLat(10.2, 48.9).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()), 5);
		return;		
	}
	
	/*
	 * Add Some vectors :)
	 */
	function addVectors(){
		/*
		 * Defining Geometry here.. fixed one
		 */
		latlong = getTransform(longitude, latitude);
		var point1 = new OpenLayers.Geometry.Point(latlong.lon, latlong.lat);
		latlong = getTransform(longitude+0.0003, latitude+0.0002);
		var point2 = new OpenLayers.Geometry.Point(latlong.lon, latlong.lat);
		latlong = getTransform(longitude+0.0003, latitude+0.0006);
		var point3 = new OpenLayers.Geometry.Point(latlong.lon, latlong.lat);
		var multi_point = new OpenLayers.Geometry.MultiPoint([point1,point2, point3]);
		var line_geom = new OpenLayers.Geometry.LineString([point1,point2, point3]);
		var geom_collect = new OpenLayers.Geometry.Collection([multi_point, line_geom]);
		
		// Define Features
		// Every feature will have some attr not the geometry e.g.
		var feature_point = new OpenLayers.Feature.Vector(geom_collect, {
			'location': 'stud farms',
			'description': 'Place for studs',
		});
		
		
		// Add a vector class and assign features to it
		var vector_layer = new OpenLayers.Layer.Vector('Basic Vector');
		
		vector_layer.onFeatureInsert = function(feature){
			//alert(feature);
		}
		
		vector_layer.addFeatures([feature_point,]);
		
		
		// Adding control for vector layer
		var select_feature_control = new OpenLayers.Control.SelectFeature(
			vector_layer,
			{
				multiple: false,
				toggle: true,
				multipleKey: 'shiftKey'
			}
			);
		
		// Add these stuff to map	
		map.addControl(select_feature_control);
		select_feature_control.activate();
		map.addLayers([vector_layer,]);
		
		console.log(map.layers);
	}
	
	/*
	 * Add Some vectors :)
	 */
	function otherAddVectors(){
		/*
		 * Defining Geometry here.. fixed one
		 */
		
		
		/*
		 * Define Features
		 * Every feature will have some attr not the geometry e.g.
		 */
		
		/*
		 * Adding styles to Vectors
		 * mechanism is : Create a Style add Style to Style Map then Add Stylemap to Vector 
		 */
		var vector_style = new OpenLayers.Style({
			'fillColor': '#660000',
			'fillOpacity': .8,
			'strokeColor': '#aa0000',
			'strokeWidth': 6,
			'pointRadius': 8
		});
		
		var vector_style_map = new OpenLayers.StyleMap({
			'default': vector_style,
		});
		
		/*
		 *
		 * Add a vector class and assign features to it
		 */
		var vector_format = new OpenLayers.Format.KML({});
		var vector_protocol = new OpenLayers.Protocol.HTTP({
				url: '/Trip/kml/',
				format: vector_format,
			})
			
		/*
		 * Feature of strategy
		 */
		var refresh_strategy = new OpenLayers.Strategy.Refresh({});
		
		var fixed_strategy = new OpenLayers.Strategy.Fixed({});
		var vector_strategy = [fixed_strategy,]
		
		
		console.log("[*] Done Loading");
		var vector_layer = new OpenLayers.Layer.Vector('Basic Vector', {
			protocol: vector_protocol,
			strategies: vector_strategy,
		});
		//refresh_strategy.activate();
		
		//ADD Style to map
		vector_layer.styleMap = vector_style_map;
		
		
		// Add these stuff to map	
		map.addLayers([vector_layer,]);
		//refresh_strategy.start();
		return;
	}
	
	/*
	 * Set a appropriate Center for graph
	 */
	function setCenter() {
		// Google.v3 uses EPSG:900913 as projection, so we have to
		// transform our coordinates
		map.setCenter( getTransform(longitude, latitude), zoomLevel);		
		return;
	}
	
	/*
	 * Transform what every Lat. Lon you want 
	 */
	function getTransform(lon, lat){
		return new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
	}
}