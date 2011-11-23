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
        featureMaxCount: FEATURE_COUNT_UNLIMITED,
        widgetOptions: {},
        defaultWidgetOption: 'dummy', // @TODO: Use DrawManager constants.
        mapOptions: {
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
      };
  // @TODO: Use DrawManager constants.
  /*defaults.widgetOptions[GMAP_WIDGET_OPTION_POINT] = 'Draw Point';
  defaults.widgetOptions[GMAP_WIDGET_OPTION_LINE] = 'Draw Line';
  defaults.widgetOptions[GMAP_WIDGET_OPTION_POLY] = 'Draw Polygon';
  defaults.widgetOptions[GMAP_WIDGET_OPTION_BOUNDS] = 'Draw Bounds';*/

  // The actual plugin constructor
  function GmapInput( element, options ) {
      this.element = element;

    // jQuery has an extend method that merges the
    // contents of two or more objects, storing the
    // result in the first object. The first object
    // is generally empty because we don't want to alter
    // the default options for future instances of the plugin
    this.options = $.extend( {}, defaults, options) ;

    this._defaults = defaults; // Default plugin options
    this._name = pluginName; // Plugin name
    this._map = null; // google.maps.Map
    this._mapcontainer = null; // jQuery object representing wrapper
    this._bounds = null; // google.maps.LatLngBounds
    this._drawManager = null; // google.maps.drawing.DrawManager
    this._dblClickTimer = null; // Timer object
    this._features = null; // FeatureManager object

    this.init();
  }

  GmapInput.prototype.init = function () {
    var $this = this;
    this.options.mapState = MAP_STATE_PANNING;
    this.options.currentFeatureType = 'dummy'; // @TODO: replace with google constant.
    this._dblClickTimer = undefined;

    this._mapcontainer = $(this.element).after('<div class="gmapInputMap"></div>').siblings('.gmapInputMap').get(0);

    // Create the map and various settings.
    var startLatLng = new google.maps.LatLng(this.options.startPoint.lat, this.options.startPoint.lon);
    var mapOptions = {
      zoom: this.options.startPoint.zoom,
      center: startLatLng,
      mapTypeId: this.options.mapOptions.mapTypeId,
      disableDoubleClickZoom: true
    };
    this._map = new google.maps.Map(this._mapcontainer, mapOptions);

    // Set up support objects.
    this._features = new FeatureManager({
      map: this._map,
      element: this.element
    });

    if (this._features.getLength() > 0) {
      this._map.fitBounds(this._features.getBounds());
    }

    // @TODO: Use options passed in from settings/defaults.
    this._drawManager = new google.maps.drawing.DrawingManager({
      map: this._map,
      drawingControlOptions: {
        drawingModes: [
          google.maps.drawing.OverlayType.MARKER,
          google.maps.drawing.OverlayType.POLYLINE,
          google.maps.drawing.OverlayType.POLYGON
        ],
        position: google.maps.ControlPosition.TOP_LEFT
      },
      markerOptions: {
        draggable: true
      },
      polylineOptions: {
        editable: true
      }
    });

    // Set up our global listeners
    google.maps.event.addListener(this._map, 'click', function(e) {
      $this.click(e);
    });
    google.maps.event.addListener(this._drawManager, 'overlaycomplete', function(e) {
      var newShape = e.overlay;
      $this._features.addFeature(newShape);
      $($this.element).val(JSON.stringify($this._features.getGeoJSON()));

      if (e.type != google.maps.drawing.OverlayType.MARKER) {
        // Switch back to non-drawing mode after drawing a shape.
        this.setDrawingMode(null);
        $this._features.setCurrentFeature(newShape.get('fmPos'));

        // Add an event listener that selects the newly-drawn shape when the user
        // mouses down on it.
        newShape.type = e.type;
        
        if (e.type == 'polygon') {
          var path = newShape.getPath();
          google.maps.event.addListener(path, 'insert_at', function(index) {
            var currentFeature = $this._features.getCurrentFeature();
            $this._features.modifyFeature(currentFeature, currentFeature.get('fmPos'));
          });
        }
        
        google.maps.event.addListener(newShape, 'click', function() {
          $this._features.setCurrentFeature(newShape.get('fmPos'));
          setSelection(newShape);
        });
        setSelection(newShape);
      }
    });
    
    function setSelection(shape) {
        selectedShape = shape;
        shape.setEditable(true);
      }
  }

  GmapInput.prototype.version = function() {
    return '0.2';
  }

  // Returns map object.
  GmapInput.prototype.getMap = function () {
    return this._map;
  }

  // General click callback.
  GmapInput.prototype.click = function (e, feature, featureType) {
    var $this = this;
    this._dblClickTimer = setTimeout(function() {
      $this._click(e, feature, featureType);
    }, 200);
  }
  
  GmapInput.prototype._click = function(e, feature, featureType) {
    if (feature == undefined) {
      var currentFeature = this._features.getCurrentFeature();
      currentFeature.setEditable(false);
      this._features.setCurrentFeature(null);
      $(this.element).val(JSON.stringify(this._features.getGeoJSON()));
    }
    /*var currentFeature = this._features.getCurrentFeature();
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
    }*/
  }

  // General doubleclick callback.
  GmapInput.prototype.doubleclick = function (e, feature, featureType) {
    clearTimeout(this._dblClickTimer);
    var currentFeature = this._features.getCurrentFeature();
    if (currentFeature != undefined) {
      this.appendPoint(new Array(e.latLng.lng(), e.latLng.lat()));
      currentFeature.setEditState(GMAP_EDIT_STATE_STATIC);
      this._features.setCurrentFeature(null);
    } else if (feature != undefined) {
      // @TODO: This is still slightly buggy, probably has to do with the off by one issue.
      var featureId = feature.getFeatureID();
      feature.setMap(null);
      this.data.removeFeature(featureId);
      $(this.element).val(this.data.stringify());
      
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

