/*
 * Gmap Input
 * Original author: @fillerwriter
 * Licensed under the GPL license
 * jQuery boilerplate provided by @ajpiano, @addyosmani
 */

// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
;(function ( $, window, document, undefined ) {

  // Constants
  var MAP_STATE_PANNING = 'panning';
  var MAP_STATE_DRAWING = 'drawing';
  
  var DRAW_POINT = 'draw point';
  var DRAW_LINE = 'draw line';
  var DRAW_POLY = 'draw polygon';
  var DRAW_BOUNDS = 'draw bounds';
  
  var FEATURE_COUNT_UNLIMITED = -1;

  // undefined is used here as the undefined global
  // variable in ECMAScript 3 and is mutable (i.e. it can
  // be changed by someone else). undefined isn't really
  // being passed in so we can ensure that its value is
  // truly undefined. In ES5, undefined can no longer be
  // modified.

  // window and document are passed through as local
  // variables rather than as globals, because this (slightly)
  // quickens the resolution process and can be more
  // efficiently minified (especially when both are
  // regularly referenced in your plugin).

  // Create the defaults once
  var pluginName = 'gmapInput',
      defaults = {
        startPoint: {
          'lat': 41.879535,
          'lon': -87.624333,
          'zoom': 7
        },
        imagePath: 'img',
        featureMaxCount: FEATURE_COUNT_UNLIMITED
      };

  // The actual plugin constructor
  function GmapInput( element, options ) {
      this.element = element;

    // jQuery has an extend method that merges the
    // contents of two or more objects, storing the
    // result in the first object. The first object
    // is generally empty because we don't want to alter
    // the default options for future instances of the plugin
    this.options = $.extend( {}, defaults, options) ;
    this.data = new GmapJSON();

    this._defaults = defaults;
    this._name = pluginName;
    this._map = null;

    this.init();
  }

  GmapInput.prototype.init = function () {
    var $this = this;
    this.options.mapState = MAP_STATE_PANNING;
    this.options.currentFeatureType = DRAW_POINT;
    this._dblClickTimer = undefined;

    this._mapcontainer = $(this.element).after('<div class="gmapInputMap"></div>').siblings('.gmapInputMap').get(0);
    var start = new google.maps.LatLng(this.options.startPoint.lat, this.options.startPoint.lon);
    var mapOptions = {
      zoom: this.options.startPoint.zoom,
      center: start,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDoubleClickZoom: true
    };

    this._map = new google.maps.Map(this._mapcontainer, mapOptions);
    
    this._features = new FeatureManager({
      "map": this._map
    });
    
    google.maps.event.addListener(this._map, 'click', function(e) {
      $this._dblClickTimer = setTimeout(function() {
        $this.click(e);
      }, 250);
    });

    google.maps.event.addListener(this._map, 'dblclick', function(e) {
      $this.doubleclick(e);
    });

    google.maps.event.addListener(this._map, 'rightclick', function(e) {
      $this.rightclick(e);
    });

    // Load data from element's value.
    if ($(this.element).val() != '') {
      var bounds = new google.maps.LatLngBounds();
      try {
        var myGeoJSON = jQuery.parseJSON($(this.element).val());
        if (myGeoJSON) {
          this.data.loadGeoJSON(myGeoJSON);
          var myData = this.data.get();
          
          if (myData.type == "GeometryCollection") {
            for (var i in myData.geometries) {
              switch (myData.geometries[i].type) {
                case 'Point':
                  this.drawPoint(myData.geometries[i].coordinates);
                break;
                case 'LineString':
                  this.drawLine(myData.geometries[i].coordinates);
                break;
                case 'Polygon':
                  this.drawPolygon(myData.geometries[i].coordinates[0]);
                break;
              }
            }
          } else {
            switch (myData.type) {
              case 'Point':
                this.drawPoint(myData.coordinates);
              break;
              case 'LineString':
                this.drawLine(myData.coordinates);
              break;
              case 'Polygon':
                this.drawPolygon(myData.coordinates[0]);
              break;
            }
          }
        }
      } catch(e) {
      }
      
      // Recenter map to show all loaded features.
      
      
      // reset back to no current polygon if we've loaded data
      var features = this._features.getFeatures();
      for (var i in features) {
        features[i].setEditState(GMAP_EDIT_STATE_STATIC);
      }
      this._features.setCurrentFeature(null);
    }

    // Added dropdown widget
    this._widget = new GmapDropdownWidget({
      imagePath: this.options.imagePath
    });
    
    $(this._widget).bind('render', function() {
      alert("RENDER");
    });
    
    var widget = this._widget.get(0);
    
    $(widget).click(function() {
    });
    
    this._map.controls[google.maps.ControlPosition.TOP_RIGHT].push(widget);
  };

  GmapInput.prototype.version = function() {
    return '0.1';
  }

  // Returns map object.
  GmapInput.prototype.getMap = function () {
    return this._map;
  }

  // General click callback.
  GmapInput.prototype.click = function (e, feature, featureType) {
    var currentFeature = this._features.getCurrentFeature();
    if (this.options.mapState == MAP_STATE_DRAWING) {
      switch (this.options.currentFeatureType) {
        case DRAW_POINT:
          this.drawPoint(new Array(e.latLng.lng(), e.latLng.lat()));
        break;
        case DRAW_LINE:
          if (currentFeature == undefined) {
            this.drawLine(new Array(new Array(e.latLng.lng(), e.latLng.lat())));
          } else {
            this.appendPoint(new Array(e.latLng.lng(), e.latLng.lat()));
          }
        break;
        case DRAW_POLY:
          if (currentFeature == undefined) {
            this.drawPolygon(new Array(new Array(e.latLng.lng(), e.latLng.lat())));
          } else {
            this.appendPoint(new Array(e.latLng.lng(), e.latLng.lat()));
          }
        break;
        case DRAW_BOUNDS:
          // @TODO: Add bounds response. But not here, in a mouse down/up callback. Bleh...
        break;
      }
    } else {
      if (feature != undefined) {
        // Panning mode + a polygon == select a polygon.
        var currentFeature = this._features.getCurrentFeature();
        if (currentFeature != undefined) {
          currentFeature.setEditState(GMAP_EDIT_STATE_STATIC);
        }
        this._features.setCurrentFeature(feature.getFeatureID());
        this.options.currentFeatureType = featureType;
        feature.setEditState(GMAP_EDIT_STATE_EDIT);
      } else {
        // Panning mode + no polygon == deselect polygon
        var currentFeature = this._features.getCurrentFeature();
        if (currentFeature != undefined) {
          currentFeature.setEditState(GMAP_EDIT_STATE_STATIC);
        }
        this._features.setCurrentFeature(null);
      }
    }
  }

  // General doubleclick callback.
  GmapInput.prototype.doubleclick = function (e, feature, featureType) {
    clearTimeout(this._dblClickTimer);
    var currentFeature = this._features.getCurrentFeature();
    if (currentFeature != undefined) {
      this.appendPoint(new Array(e.latLng.lng(), e.latLng.lat()));
      currentFeature.setEditState(GMAP_EDIT_STATE_STATIC);
      this._features.setCurrentFeature(null);
    }
  }

  // General rightclick callback.
  GmapInput.prototype.rightclick = function (e, feature, featureType) {
  
  }

  // General mouseup callback.
  GmapInput.prototype.mouseup = function (e, feature, featureType) {
    this.data.replaceCoordinate(e.latLng.lng(), e.latLng.lat(), e.featureID, feature.getFeatureID() - 1);
    $(this.element).val(this.data.stringify());
  }

  // Switch drawing setting to point drawing
  GmapInput.prototype.drawPoint = function (coordinate) {
    var $this = this;
    var marker = new GmapPointFeatureEdit({
      feature: new google.maps.Marker({
        position: new google.maps.LatLng(coordinate[1], coordinate[0])
      })
    });

    var markerID = $this._features.addFeature(marker);
    marker.setFeatureID(markerID);
    marker.setEditState(GMAP_EDIT_STATE_EDIT);

    google.maps.event.addListener(marker, 'click', function(e) {
      $this.click(e, this, 'Point');
    });

    google.maps.event.addListener(marker, 'dblclick', function(e) {
      $this.doubleclick(e, this, 'Point');
    });
    
    google.maps.event.addListener(marker, 'mouseup', function(e) {
      $this.mouseup(e, this, 'Point');
    });

    this.data.addFeature('Point');
    this.data.addCoordinate(coordinate[1], coordinate[0]);
    $(this.element).val(this.data.stringify());
  }

  // Switch drawing setting to line drawing
  GmapInput.prototype.drawLine = function (coordinates) {
    var $gmapinput = this;

    var line = new GmapPolyFeatureEdit({
      feature: new google.maps.Polyline(),
      "imagePath": this.options.imagePath
    });

    var lineID = $gmapinput._features.addFeature(line);
    line.setFeatureID(lineID);
    $gmapinput._features.setCurrentFeature(lineID);
    line.setEditState(GMAP_EDIT_STATE_EDIT);

    google.maps.event.addListener(line, 'click', function(e) {
      $gmapinput.click(e, this, 'Line');
    });

    google.maps.event.addListener(line, 'dblclick', function(e) {
      $gmapinput.doubleclick(e, this, 'Line');
    });

    google.maps.event.addListener(line, 'mouseup', function(e) {
      $gmapinput.mouseup(e, this, 'Line');
    });

    this.data.addFeature('LineString');

    for (var i in coordinates) {
      this.appendPoint(coordinates[i]);
    }
  }

  // Switch drawing setting to polygon drawing
  GmapInput.prototype.drawPolygon = function (coordinates) {
    var $gmapinput = this;

    var poly = new GmapPolyFeatureEdit({
      feature: new google.maps.Polygon(),
      "imagePath": this.options.imagePath
    });

    var polyID = $gmapinput._features.addFeature(poly);
    poly.setFeatureID(polyID);
    $gmapinput._features.setCurrentFeature(polyID);
    poly.setEditState(GMAP_EDIT_STATE_EDIT);

    google.maps.event.addListener(poly, 'click', function(e) {
      $gmapinput.click(e, this, 'Polygon');
    });

    google.maps.event.addListener(poly, 'dblclick', function(e) {
      $gmapinput.doubleclick(e, this, 'Polygon');
    });

    google.maps.event.addListener(poly, 'mouseup', function(e) {
      $gmapinput.mouseup(e, this, 'Polygon');
    });

    this.data.addFeature('Polygon');

    for (var i in coordinates) {
      this.appendPoint(coordinates[i]);
    }
  }

  // Add coordinate to current feature. Really only applicable to lines and polygons
  GmapInput.prototype.appendPoint = function(coordinate) {
    var currentFeature = this._features.getCurrentFeature();
    if (currentFeature != undefined) {
      var path = currentFeature.getPath();
      path.push(new google.maps.LatLng(coordinate[1], coordinate[0]));

      this.data.addCoordinate(coordinate[1], coordinate[0]);
      $(this.element).val(this.data.stringify());
    }
  }

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName,
        new GmapInput( this, options ));
      }
    });
  }

})( jQuery, window, document );

