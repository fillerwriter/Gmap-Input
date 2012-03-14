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
        featureDefaults: {
          marker: {
          
          },
          polyLine: {
          
          },
          polygon: {
          
          }
        },
        properties: undefined, // Key/Value pairs to save for each item.
        imagePath: 'img',
        featureMaxCount: FEATURE_COUNT_UNLIMITED,
        widgetOptions: [
          google.maps.drawing.OverlayType.MARKER,
          google.maps.drawing.OverlayType.POLYLINE,
          google.maps.drawing.OverlayType.POLYGON
        ],
        defaultWidgetOption: null,
        forceGeoCollection: false,
        mapOptions: {
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
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

    this._defaults = defaults; // Default plugin options
    this._name = pluginName; // Plugin name
    this._map = null; // google.maps.Map
    this._mapcontainer = null; // jQuery object representing wrapper
    this._bounds = null; // google.maps.LatLngBounds
    this._drawManager = null; // google.maps.drawing.DrawManager
    this._dblClickTimer = null; // Timer object
    this._features = null; // FeatureManager object
    this._infoWindow = null // google.maps.InfoWindow

    this.init();
  }

  GmapInput.prototype.init = function () {
    var $this = this;
    this.options.mapState = MAP_STATE_PANNING;
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
      element: this.element,
      forceGeoCollection: this.options.forceGeoCollection
    });

    var initialFeatureCount = this._features.getLength();
    if (initialFeatureCount > 0) {
      this._map.fitBounds(this._features.getBounds());
      
      for (var i = 0; i < initialFeatureCount; i++) {
        var feature = this._features.getFeatureAt(i);
        this.featureEventsRegister(feature);
      }
      
    }

    // @TODO: Use options passed in from settings/defaults.
    var markerOptions = $.extend({draggable: true}, this.options.featureDefaults.marker);
    var polylineOptions = $.extend({draggable: true}, this.options.featureDefaults.polyLine);
    var polygonOptions = $.extend({draggable: true}, this.options.featureDefaults.polygon);
    this._drawManager = new google.maps.drawing.DrawingManager({
      map: this._map,
      drawingControlOptions: {
        drawingModes: this.options.widgetOptions,
        position: google.maps.ControlPosition.TOP_LEFT
      },
      markerOptions: markerOptions,
      polylineOptions: polylineOptions,
      polygonOptions: polygonOptions
    });

    var infoContent = "";
    if ($this.options.properties) {
      infoContent += "<form class='map-property-form'>";
      for (var key in $this.options.properties) {
        infoContent += "<div class='" + key + "-wrapper'><label>" + key + ":</label><input name='" + key + "-input' class='" + key + "-input' value='" + $this.options.properties[key] + "'/></div>";
      }
      infoContent += "<div><input type='submit' value='Save' /></form>";
    }
    infoContent += "<p><a class='deleteLink' href='#'>Delete</a></p>";

    this._infoWindow = new google.maps.InfoWindow({
      content: infoContent
    });

    // Set up our global listeners
    google.maps.event.addListener(this._map, 'click', function(e) {
      $this.click(e);
    });

    google.maps.event.addListener(this._infoWindow, 'closeclick', function(e) {
      var currentFeature = $this._features.getCurrentFeature();
      if (!currentFeature.getPos && currentFeature.setEditable) {
        currentFeature.setEditable(false);
      }
      $this._features.setCurrentFeature(undefined);
    });

    google.maps.event.addListener(this._drawManager, 'overlaycomplete', function(e) {
      var newShape = e.overlay;

      // Validation
      if (e.type == google.maps.drawing.OverlayType.POLYGON) {
        var path = newShape.getPath();
        if (path.getLength() < 2) {
          newShape.setMap(null);
          return;
        }
      }

      // At this point, we're good to go.
      if ($this.options.properties) {
        newShape.set('geojsonProperties', $this.options.properties);
      }

      // Special case, if we set feature max to 1, drop all properties, add current one.
      if ($this.options.featureMaxCount == 1 && $this._features.getLength() > 0) {
        $this._features.removeAllFeatures();
      }

      $this._features.addFeature(newShape);
      $($this.element).val(JSON.stringify($this._features.getGeoJSON()));

      this.setDrawingMode(null);
      $this._features.setCurrentFeature(newShape.get('fmPos'));

      newShape.type = e.type;
      $this.featureEventsRegister(newShape);
      setSelection(newShape);

      if ($this.options.properties != undefined) {
        $this._openInfoWindow(newShape);
      }
    });

    function setSelection(shape) {
      if (shape.type != "marker") {
        shape.setEditable(true);
      }
    }
  }

  GmapInput.prototype.version = function() {
    return '0.2';
  }

  // Returns map object.
  GmapInput.prototype.getMap = function () {
    return this._map;
  }

  // Returns map object.
  GmapInput.prototype.getDrawManager = function () {
    return this._drawManager;
  }
  
  GmapInput.prototype.getFeatureManager = function() {
    return this._features;
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
      if (currentFeature) {
        if (currentFeature.type != "marker") {
          currentFeature.setEditable(false);
        }
        this._features.setCurrentFeature(null);
        $(this.element).val(JSON.stringify(this._features.getGeoJSON()));
      }
    }
  }

  // General doubleclick callback.
  GmapInput.prototype.doubleclick = function (e, feature, featureType) {
    clearTimeout(this._dblClickTimer);
  }

  // General rightclick callback.
  GmapInput.prototype.rightclick = function (e, feature, featureType) {
    
  }

  // Opens an infowindow on current feature.
  GmapInput.prototype._openInfoWindow = function(feature) {
    var $this = this;
    if (feature == undefined) {
      feature = $this._feature.getCurrentFeature();
    }
    
    var localBounds = feature.get("localBounds");
    $this._infoWindow.setPosition(localBounds.getCenter());
    $this._infoWindow.open($this._map);

    // Set form elements in form window
    var properties = feature.get('geojsonProperties');
    for (var i in properties) {
      $('.' + i + '-input').val(properties[i]);
    }
    
    // @TODO: change to limit to just our map, not globally
    $('.deleteLink').click(function(event) {
      event.preventDefault();
      var current = $this._features.getCurrentFeature();
      $this._features.removeFeatureAt(current.get('fmPos'));
      $($this.element).val(JSON.stringify($this._features.getGeoJSON()));
      $this._infoWindow.close();
    });

    // @TODO: change to limit to just our map, not globally
    $('.map-property-form').submit(function() {
      var current = $this._features.getCurrentFeature();
      var properties = {};
      for (var i in $this.options.properties) {
        properties[i] = $('.' + i + "-input").val();
      }
      current.set('geojsonProperties', properties);
      $this._features.modifyFeature(current, current.get('fmPos'));
      $this._infoWindow.close();
      $($this.element).val(JSON.stringify($this._features.getGeoJSON()));
      return false;
    });
    // end @TODO
  }

  // Register common events for a feature
  GmapInput.prototype.featureEventsRegister = function(feature) {
    var $this = this;
    var featureType = feature.get('type');
    if (featureType == 'polygon' || featureType == 'polyline') {
      var path = feature.getPath();
      google.maps.event.addListener(path, 'insert_at', function(index) {
        var currentFeature = $this._features.getCurrentFeature();
        $this._features.modifyFeature(currentFeature, currentFeature.get('fmPos'));
      });
    } else if (featureType == 'marker') {
      feature.setDraggable(true);
      google.maps.event.addListener(feature, 'dragend', function(e) {
        var pos = this.get('fmPos');
        $this._features.modifyFeature(this, pos);
        $($this.element).val(JSON.stringify($this._features.getGeoJSON()));
        $this._infoWindow.close();
      });
    }

    google.maps.event.addListener(feature, 'click', function(e) {
      $this._features.setCurrentFeature(this.get('fmPos'));
      if (feature.get('type') != "marker") {
        feature.setEditable(true);
      }
    });

    google.maps.event.addListener(feature, 'dblclick', function(e) {
      $this._features.setCurrentFeature(this.get('fmPos'));
      $this._openInfoWindow(feature);
    });
  }

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, pluginName)) {
        $.data(this, pluginName,
        new GmapInput( this, options ));
      }
    });
  }

})( jQuery, window, document );

