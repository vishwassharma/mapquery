/*
 * Feature information selector
 */

;(function($) {
	// $.template('mqFeatureInfo',
	// '<div class="mq-featureinfo ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">' +
	// '<span class="ui-dialog-title">${title}</span>' +
	// '</div>' +
	// '<div" class="ui-dialog-content ui-widget-content">{{html contents}}</div>');
	$.widget("LogicStick.featureinfo", {
		options : {
			// The Logicstick instance
			map : undefined,

			// A function that returns HTML to be put into the popup.
			// It has one argument, which is the OpenLayers feature that
			// was selected.
			contents : undefined,

			// Title that will be displayed at the top of the feature info
			title : "Feature information"
		},
		_create : function() {
			var map = {};
			//console.log(this);
			var self = this;

			this.mulipoint = [];

			this.map = $(this.options.map).data('logicstick');
			if(!this.map) {
				//console.log("[*] No such instance found");
				throw "No instance";
			}

			// once we have a map then get all the layers
			// identify layer on which you want to activate selection
			this.vectors_layer = this.map.getVectors();

			$.each(this.vectors_layer, function(i, vect) {

				// set the multipoint;

				// Set event handlers related to vectors
				vect.bind('featureselected', {
					widget : self
				}, self._onFeatureSelected);
				//vect.bind('featurehighlighted', {widget: self} , self._onFeatureHighlighed);
				vect.bind('featureadded', {
					widget : self
				}, self._onFeatureAdded);
				vect.bind('beforefeatureadded', {
					widget : self
				}, self._onBeforeFeatureAdded);
				vect.bind('featureunselected', {
					widget : self
				}, self._onFeatureUnselected);
				vect.bind('refresh', {
					widget : self
				}, self._onRefresh);
			});
		},
		_destroy : function() {
			console.log('destroy');
		},
		_onBeforeFeatureAdded : function(e, data) {
			//console.log('[*] Before Features Added');
			var isOnScreen = data.feature.onScreen();
			console.log('[*] Is indivisual feature visible : ' + data.feature.onScreen());
			if(isOnScreen === true) {
				return;
			}

			var self = e.data.widget;
			var element = self.element;
			var layer = data.feature.layer;
			var map = data.feature.layer.map;

			//self.vectors_layer;
			var old_features = $.map(self.vectors_layer, function(v, i) {
				//console.log(v.layer);
				return v.layer.features;
			});
			//console.log(old_features);
			old_features.push(data.feature);

			var multipoint = new OpenLayers.Geometry.MultiPoint(self._getGeom(old_features));
			map.zoomToExtent(multipoint.getBounds());
			// Find all the points which have been drawn
			// what we know about geometry

			//self.features.push(data.feature);
			// create a multipoint feature which is going to be formed
			

			// if we are not on screen then do some work
			// multipoint.getCentroid();

			//console.log(map.getExtent());
			//console.log('---------------');
		},
		_getGeom : function(all_features) {
			var geom = [];
			geom = $.map(all_features, function(f, i) {
				return f.geometry;
			});
			return geom;
		},
		_getCentroid : function(array) {
			var multipoint = new OpenLayers.Geometry.MultiPoint(array);
			return {
				centroid : multipoint.getCentroid(),
				bound : multipoint.getExtent(),
			};
		},
		_onFeatureAdded : function(e, data) {
			//console.log('[*] Features Added');
			var self = e.data.widget;
			var element = self.element;
			//console.log(data.feature.geometry.x + ' '+ data.feature.geometry.y);
			//console.log('---------------');
		},
		_onFeatureHighlighed : function(e, data) {
			console.log('[*] Highlighted');
		},
		_onFeatureSelected : function(e, data) {
			//console.log("[*] Certain Feature is selected");
			var self = e.data.widget;
			var element = self.element;

			// all the data about the feature will in data
			// var f = data.feature;  // f.data.name and f.data.description
			// self.contents(f);

			//console.log(data.feature);

			var contents = self.options.contents.call(this, data.feature);

			element.html(contents);

			return;
		},
		_onFeatureUnselected : function(e, data) {
			console.log("[*] Certain Feature is unselected");
			return;
		},
		_onRefresh : function(e, data) {
			var self = e.data.widget;
			var element = self.element;
			var f = data.feature;
			// f.data.name and f.data.description
			//data.object;
			console.log(f);
			return;
		},
	});
})(jQuery);
