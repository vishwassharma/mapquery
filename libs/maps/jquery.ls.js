/*
 * RE creating the plugin
 */

;(function($) {

	/*
	 * Create a namespace that can be exported
	 */
	$.LogicStick = $.LogicStick || {};

	/*
	 * Create a map which represent the logicstick class
	 * element : is jquery selector
	 * options : this will contain all the options
	 */
	$.LogicStick.Map = function(element, options) {
		//console.log("[*] LogicStick Maps");
		var self = this;

		this.olMap = {};
		// Map object that would be initialized
		this.options = options;
		// user supplied options
		this.element = element;
		// jquery selected object
		this.counter = 0;
		// Create unique id counter
		this.layerList = {};
		// a list that will maintain the layerlist
		this.vectorList = [];

		// options initialize
		if(this.options) {
			// if(!this.options.maxResolution && this.options.maxExtent && this.options.projection) {
				// this.options.maxResolution = (this.options.maxExtent[2] - this.options.maxExtent[0]) / 256;
			// }
		}
		var olMapOption = $.extend({}, $.fn.logicstick.defaults.map(), this.options);
		delete olMapOption.layers;
		delete olMapOption.center;
		//console.log(olMapOption);
		var maxExtent = olMapOption.maxExtent;
		//delete olMapOption.maxExtent;
		var zoomToMaxExtent = olMapOption.zoomToMaxExtent;
		delete olMapOption.zoomToMaxExtent;

		// initialize maps
		this.olMap = new OpenLayers.Map(this.element[0], olMapOption);

		// Add a fake layer
		this.olMap.addLayer(new OpenLayers.Layer('fake', {
			baseLayer : true
		}));

		element.data('logicstick', this);

		this.events = $({});
		// create triggers for all OpenLayers map events
		var events = {};
		$.each(this.olMap.EVENT_TYPES, function(i, evt) {
			events[evt] = function() {
				//console.log(evt);
				//console.log(self.events);
				self.events.trigger(evt, arguments);
			};
		});
		this.olMap.events.on(events);

		// Get map type
		if(this.options.layers !== undefined) {
			// Create Layer
			this.setLayer(this.options.layers);
			if(this.options.center !== undefined) {
				// Add layers
				this.setCenter(this.options.center);
			}
		}

		// zoom to the maxExtent of the map if no precise location was specified
		//console.log(this.options);
		//console.log(olMapOption);
		if(zoomToMaxExtent && this.options.center === undefined) {
			//this.olMap.zoomToExtent();
			console.log('i am here');
			//console.log(maxExtent);
			this.olMap.zoomToExtent(maxExtent);
		}
	}

	$.LogicStick.Map.prototype = {
		setLayer : function(layers) {
			//console.log("[*] Setting layers");

			// create instance of this class so that we can use
			// its functions
			var self = this;

			$.each(layers, function(id, layer) {
				self._addLayer(layer);
			})
			return;
		},
		/*
		 * Add a layer which is what we are destined to do
		 */
		_addLayer : function(layer) {
			//console.log(layer);
			var id = this._createId();

			// Create a layer
			var l = new $.LogicStick.Layer(this, id, layer);

			// Classify layers based on type and store in global variable
			this.layerList[id] = l;

			if(l.isVector) {
				this.vectorList.push(id);
				//this._updateSelectFeatureControl(l.layer);
			}
			return;
		},
		getVectors : function() {
			var self = this;
			var result = $.map(this.vectorList, function(k) {
				return self.layerList[k];
			});
			return result;
		},
		/*
		 * Create a unique id for layers
		 */
		_createId : function() {
			return 'ls' + this.counter++;
		},
		/*
		* Set Center :
		*/
		/**
		 ###*map*.`center([options])`
		 _version added 0.1_
		 ####**Description**: get/set the extent, zoom and position of the map

		 * **position** the position as [x,y] in displayProjection (default EPSG:4326)
		 to center the map at
		 * **zoom** the zoomlevel as integer to zoom the map to
		 * **box** an array with the lower left x, lower left y, upper right x,
		 upper right y to zoom the map to,
		 this will take precedent when conflicting with any of the above values
		 * **projection** the projection the coordinates are in, default is
		 the displayProjection

		 >Returns: {position: [x,y], zoom: z(int), box: [llx,lly,urx,ury]}

		 The `.center()` method allows us to move to map to a specific zoom level,
		 specific position or a specific extent. We can specify the projection of the
		 coordinates to override the displayProjection. For instance you want to show
		 the coordinates in 4326, but you have a dataset in EPSG:28992
		 (dutch projection). We can also retrieve the current zoomlevel, position and
		 extent from the map. The coordinates are returned in displayProjection.

		 var center = map.center(); //get the current zoom, position and extent
		 map.center({zoom:4}); //zoom to zoomlevel 4
		 map.center({position:[5,52]}); //pan to point 5,52
		 map.center(box:[-180,-90,180,90]); //zoom to the box -180,-900,180,90
		 //pan to point 125000,485000 in dutch projection
		 map.center({position:[125000,485000],projection:'EPSG:28992'});
		 */
		setCenter : function(options) {
			var position;
			var mapProjection;
			// Determine source projection
			var sourceProjection = null;
			var zoom;
			var box;
			if(options && options.projection) {
				sourceProjection = options.projection.CLASS_NAME === 'OpenLayers.Projection' ? options.projection : new OpenLayers.Projection(options.projection);
			} else {
				var displayProjection = this.olMap.displayProjection;
				if(!displayProjection) {
					// source == target
					sourceProjection = new OpenLayers.Projection('EPSG:4326');
				} else {
					sourceProjection = displayProjection.CLASS_NAME === 'OpenLayers.Projection' ? displayProjection : new OpenLayers.Projection(displayProjection);
				}
			}

			// Get the current position
			if(arguments.length === 0) {
				position = this.olMap.getCenter();
				zoom = this.olMap.getZoom();
				box = this.olMap.getExtent();
				mapProjection = this.olMap.getProjectionObject();

				if(!mapProjection.equals(sourceProjection)) {
					position.transform(mapProjection, sourceProjection);
				}
				box.transform(mapProjection, sourceProjection);
				box = box !== null ? box.toArray() : [];
				return {
					position : [position.lon, position.lat],
					zoom : this.olMap.getZoom(),
					box : box
				};
			}

			// Zoom to the extent of the box
			if(options.box !== undefined) {
				mapProjection = this.olMap.getProjectionObject();
				box = new OpenLayers.Bounds(options.box[0], options.box[1], options.box[2], options.box[3]);
				if(!mapProjection.equals(sourceProjection)) {
					box.transform(sourceProjection, mapProjection);
				}
				this.olMap.zoomToExtent(box);

			}
			// Only zoom is given
			else if(options.position === undefined) {
				this.olMap.zoomTo(options.zoom);
			}
			// Position is given, zoom maybe as well
			else {
				position = new OpenLayers.LonLat(options.position[0], options.position[1]);
				mapProjection = this.olMap.getProjectionObject();
				if(!mapProjection.equals(sourceProjection)) {
					position.transform(sourceProjection, mapProjection);
				}
				// options.zoom might be undefined, so we are good to
				// pass it on
				this.olMap.setCenter(position, options.zoom);
			}
		},
		// setCenter : function(){
		// var longitude = 77.611195;
		// var latitude = 12.940523;
		// var zoomLevel = 13;
		//
		// console.log(options);
		//
		// this.olMap.setCenter(this.getTransform(longitude, latitude), zoomLevel);
		// },
		// getTransform : function(lon, lat) {
		// return new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"), this.olMap.getProjectionObject());
		// },
		pan : function(x, y){
			return this.olMap.pan(x, y);
		},
		bind : function() {
			//console.log(this.events);
			this.events.bind.apply(this.events, arguments);
		},
		one : function() {
			this.events.one.apply(this.events, arguments);
		},
	};
	// ===============================================

	/*
	 * ===============================================
	 * Create a layer which will be used to maintain
	 * ===============================================
	 *
	 */
	$.LogicStick.Layer = function(map_obj, id, options) {
		//console.log("[*] LogicStick Layer");

		// init global variables
		this.map = map_obj;
		// $.LogicStick.Map object
		this.id = id;
		this.isVector = false;
		this.isDynamic = false;
		var self = this;
		var isSelectable = options.selectable || false;
		//selectable: false

		//console.log(options);

		// Call the function based on types
		var res = this.types[options.type.toLowerCase()].call(this, options);
		this.layer = res.layer;
		// set up layer
		this.options = res.options;
		// get all the options which was used to init layer
		this.events = $({});
		// create triggers for all OpenLayers layer events

		// if selectable layer then start they control

		if(isSelectable && this.isVector) {
			//console.log('Adding select controller');
			this._updateSelectFeatureControl();
		}

		var events = {};

		$.each(this.layer.EVENT_TYPES, function(i, evt) {
			// TODO : implement the idea of namespace events
			events[evt] = function() {
				console.log(evt);
				//console.log(self.events);
				self.events.trigger(evt, arguments);
				self.map.events.trigger(evt, arguments);
			};
		});

		this.layer.events.on(events);

		// Add this layer to Map object
		this.map.olMap.addLayer(this.layer);
	}

	$.LogicStick.Layer.prototype = {
		/*
		 *
		 */
		_updateSelectFeatureControl : function() {
			var vect_layer = this.layer;
			// given a layer do something
			var c = new OpenLayers.Control.SelectFeature(vect_layer, {
				multiple : false,
				highlightOnly : true,
				hover : true,
				renderIntent : "temporary",
			});
			var selectCtrl = new OpenLayers.Control.SelectFeature(vect_layer, {
				clickout : true,
				//onSelect : addSelectPopup,
				//onUnselect : removeSelectPopup,
			});
			this.map.olMap.addControl(c);
			this.map.olMap.addControl(selectCtrl);
			c.activate();
			selectCtrl.activate();
		},
		// every event gets the layer passed in
		bind : function() {
			//console.log('[*] Binding');
			//console.log(this.events);
			//console.log('[*] done');

			this.events.bind.apply(this.events, arguments);
		},
		one : function() {
			this.events.one.apply(this.events, arguments);
		}
	};

	/*
	 * Adding maps types with specific options
	 */
	$.extend($.LogicStick.Layer.prototype, {
		types : {
			google : function(options) {
				//console.log("[*] Google maps");

				var lopt = $.extend(true, {}, $.fn.logicstick.defaults.layers.all, $.fn.logicstick.defaults.layers.google, options);
				var view = google.maps.MapTypeId.ROADMAP;
				var _lr = new OpenLayers.Layer.Google({
					type : view
				});

				return {
					layer : _lr,
					options : lopt,
				}
			},
			osm : function(options) {
				//console.log('[*] OSM Maps');

				var lopt = $.extend(true, {}, $.fn.logicstick.defaults.layers.all, $.fn.logicstick.defaults.layers.osm, options);
				var _lr = new OpenLayers.Layer.OSM(lopt);

				return {
					layer : _lr,
					options : lopt,
				};
			},
			vector : function(options) {
				//console.log('[*] Vector layer');

				var lopt = $.extend(true, {}, $.fn.logicstick.defaults.layers.all, $.fn.logicstick.defaults.layers.vector, options);
				//console.log(lopt);
				var _lr = {};
				var r = {};
				if(lopt.format !== undefined) {
					//change
					r = this.dynamic[lopt.format.toLowerCase()].call(this, lopt);
					lopt = r.options;
					var s = r.strategy;
					var p = r.protocol;
					_lr = new OpenLayers.Layer.Vector(this.id, {
						protocol : p,
						strategies : s,
					});
					// $.each(s, function(i, st){
						// st.activate();
					// });

				} else {
					_lr = new OpenLayers.Layer.Vector(this.id);
				}
				this.isVector = true;

				return {
					layer : _lr,
					options : lopt,
				}
			},
		},
	});

	$.extend($.LogicStick.Layer.prototype, {
		dynamic : {
			_base : function(format, o) {
				var vector_format;
				if(o.track !== undefined) {
					vector_format = new OpenLayers.Format[format]({
						extractTracks : true,
					});
				} else {
					vector_format = new OpenLayers.Format[format]({});
				}

				var vector_strategy = [];
				var vector_protocol = null;
				var value = {
					url : o.url+'?key='+Math.random(),
					//url : o.url,
					format : vector_format,
				}

				if(o.protocol.toLowerCase() === 'http') {
					vector_protocol = new OpenLayers.Protocol.HTTP(value);
				} else if(o.protocol.toLowerCase() === 'wfs') {
					vector_protocol = new OpenLayers.Protocol.WFS(value);
				}

				//console.log(o.strategies);
				$.each(o.strategies, function(i, val) {
					switch(val.toLowerCase()) {
						case 'fixed':
							vector_strategy.push(new OpenLayers.Strategy.Fixed({}));
							break;
						case 'refresh':
							//console.log('refresh');
							vector_strategy.push(new OpenLayers.Strategy.Refresh({interval: 6000, force: true}));
							break;
						case 'bbox':
							vector_strategy.push(new OpenLayers.Strategy.BBOX({}));
							break;
						default:
							break;
					}
				});
				
				return {
					proto : vector_protocol,
					stra : vector_strategy,
				};
			},
			kml : function(options) {
				//console.log('[*] KML protocol');
				var o = $.extend({}, $.fn.logicstick.defaults.layers.kml, options.kml);

				if(o.url) {
					this.isDynamic = true;
				}

				var res = this.dynamic._base('KML', o);

				return {
					protocol : res.proto,
					strategy : res.stra,
					options : o,
				};
			},
			json : function(options) {
				//console.log('[*] KML protocol');
				var o = $.extend({}, $.fn.logicstick.defaults.layers.json, options.json);
				if(o.url) {
					this.isDynamic = true;
				}
				var res = this.dynamic._base('JSON', o);

				return {
					protocol : res.proto,
					strategy : res.stra,
					options : o,
				};
			},
			wkt : function(options) {
				//console.log('[*] KML protocol');
				var o = $.extend({}, $.fn.logicstick.defaults.layers.wkt, options.wkt);
				if(o.url) {
					this.isDynamic = true;
				}
				var res = this.dynamic._base('WKT', o);

				return {
					protocol : res.proto,
					strategy : res.stra,
					options : o,
				};
			},
		}
	});

	// ===============================================

	/*
	 * ===============================================
	 * Initialize the plugin
	 * ===============================================
	 */
	$.fn.logicstick = function(options) {
		//console.log("[*] Initializing Plugin");
		//check for data
		return this.each(function() {
			var element = $(this);
			// The jQuery selector
			var instance = element.data('logicstick');
			if(instance)
				return;
			$.data(this, 'logicstick', new $.LogicStick.Map($(this), options));
		});
	}
	/*
	 * Setting up default options
	 */
	$.fn.logicstick.defaults = {
		map : function(){
			return {
			theme : '/static/mapper/css/map.css',
			controls : [
			// Since OL2.11 the Navigation control includes touch navigation as well
			new OpenLayers.Control.Navigation({
				documentDrag : true,
				dragPanOptions : {
					interval : 1,
					enableKinetic : true
				}
			}), new OpenLayers.Control.ArgParser(), new OpenLayers.Control.Attribution(), new OpenLayers.Control.KeyboardDefaults()],
			numZoomLevels : 19,
			displayProjection : 'EPSG:4326',
			//projection: 'EPSG:900913',
			zoomToMaxExtent : true,
			units : 'm',
			transitionEffect: 'resize',
			maxExtent : new OpenLayers.Bounds(50 * 156543.0339, 5 * 156543.0339, 60 * 156543.0339, 30 * 156543.0339),
			//maxExtent : [-128 * 156543.0339, -128 * 156543.0339, 128 * 156543.0339, 128 * 156543.0339],
			// india lat ; 8 to 37
			// india lon : 68 to 97
			//maxExtent : [68, 37, 97, 8],
			maxResolution : 156543.0339,

			//maxExtent: new OpenLayers.Bounds(50 * 156543.0339, 5 * 156543.0339, 60 * 156543.0339, 30 * 156543.0339)
			//minExtent: new OpenLayers.Bounds(-1, -1, 1, 1),
			restrictedExtent : new OpenLayers.Bounds(50 * 156543.0339, 5 * 156543.0339, 60 * 156543.0339, 30 * 156543.0339),
			}
		},
		layers : {
			all : {
				isBaseLayer : false,
				displayOutsideMaxExtent : false,
			},
			google : {
				transitionEffect : 'resize',
				view : 'road',
				sphericalMercator : true,
				numZoomLevels : 20,
			},
			osm : {
				transitionEffect : 'resize',
				sphericalMercator : true,
			},
			kml : {

			},
		},

	};
})(jQuery);
