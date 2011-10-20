/*
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
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
    this.options.currentOverlay = undefined;
    this.options.dblClickTimer = undefined;

    this._mapcontainer = $(this.element).after('<div class="gmapInputMap"></div>').siblings('.gmapInputMap').get(0);
    var start = new google.maps.LatLng(this.options.startPoint.lat, this.options.startPoint.lon);
    var mapOptions = {
      zoom: this.options.startPoint.zoom,
      center: start,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDoubleClickZoom: true
    };

    this._map = new google.maps.Map(this._mapcontainer, mapOptions);
    google.maps.event.addListener(this._map, 'click', function(e) {
      $this.click(e);
    });

    var drawControlContainer = document.createElement('DIV');
    var list = $('<ul>').addClass('control').css({
      'background-color': '#FFF',
      'list-style': 'none',
      'padding-left': 0,
      'font-family': '"Helvetica", sans-serif',
      'font-size': '0.8em'
    })
      .html('<li>Draw Point</li><li>Draw Line</li><li>Draw Polygon</li><li>Draw Bounds</li>');

    var drawControl = $('<div>').append(list).append('<div class="dropdown">expand</div>');
    
    drawControlContainer.innerHTML = drawControl.html();
    this._map.controls[google.maps.ControlPosition.TOP_RIGHT].push(drawControlContainer);
    
    $('li', drawControlContainer).click(function () {
      var draw_options = new Object();
      draw_options[DRAW_POINT] = 'Draw Point';
      draw_options[DRAW_LINE] = 'Draw Line';
      draw_options[DRAW_POLY] = 'Draw Polygon';
      draw_options[DRAW_BOUNDS] = 'Draw Bounds';

      $(this).parent().find('li').css('background-color', '#FFF');

      if ($(this).text() == draw_options[$this.options.currentFeatureType]) {
        if ($this.options.mapState == MAP_STATE_DRAWING) {
          $this.options.mapState = MAP_STATE_PANNING;
        } else {
          $this.options.mapState = MAP_STATE_DRAWING;
          $(this).css('background-color', '#F00');
        }
      } else {
        $this.options.mapState = MAP_STATE_DRAWING;
        $(this).css('background-color', '#F00');
      }

      switch ($(this).text()) {
        case 'Draw Point':
          $this.options.currentFeatureType = DRAW_POINT;
        break;
        case 'Draw Line':
          $this.options.currentFeatureType = DRAW_LINE;
        break;
        case 'Draw Polygon':
          $this.options.currentFeatureType = DRAW_POLY;
        break;
        case 'Draw Bounds':
          $this.options.currentFeatureType = DRAW_BOUNDS;
        break;
      }
      
      $this.options.currentOverlay = undefined;
    });
    
    $('.dropdown', drawControlContainer).click(function () {
      // @TODO: Add dropdown widget
    });
  };

  // Returns map object.
  GmapInput.prototype.getMap = function () {
    return this._map;
  }

  // General click callback.
  GmapInput.prototype.click = function (e, feature, featureType) {
    if (feature == undefined) {
      if (this.options.mapState == MAP_STATE_DRAWING) {
        switch (this.options.currentFeatureType) {
          case DRAW_POINT:
            this.drawPoint(e);
          break;
          case DRAW_LINE:
            this.drawLine(e);
          break;
          case DRAW_POLY:
            this.drawPolygon(e);
          break;
          case DRAW_BOUNDS:
            // @TODO: Add bounds response.
          break;
        }
      }
    } else {
      // Panning mode + a polygon == select a polygon.
      alert("CLICKED A " + featureType);
    }
  }

  // General doubleclick callback.
  GmapInput.prototype.doubleclick = function (e) {
    
  }

  // Switch drawing setting to point drawing
  GmapInput.prototype.drawPoint = function (e) {
    $this = this;
    var marker = new google.maps.Marker({
      position: e.latLng,
      map: this._map
    });
    
    google.maps.event.addListener(marker, 'click', function(e) {
      $this.click(e, this, 'Point');
    });
    
    this.data.addFeature('Point');
    this.data.addCoordinate(e.latLng.lat(), e.latLng.lng());
    $(this.element).val(this.data.stringify());
  }

  // Switch drawing setting to line drawing
  GmapInput.prototype.drawLine = function (e) {
    $this = this;
    if (this.options.currentOverlay == undefined) {
      var lineOptions = {
        strokeColor: '#FFCC66',
        strokeOpacity: 1.0,
        strokeWeight: 3
      };

      this.options.currentOverlay = new google.maps.Polyline(lineOptions);
      this.options.currentOverlay.setMap(this._map);
      
      google.maps.event.addListener(this.options.currentOverlay, 'click', function(e) {
        $this.click(e, this, 'Line');
      });
      
      this.data.addFeature('LineString');
    }
    
    var path = this.options.currentOverlay.getPath();
    path.push(e.latLng);
    
    this.data.addCoordinate(e.latLng.lat(), e.latLng.lng());
    $(this.element).val(this.data.stringify());
  }

  // Switch drawing setting to polygon drawing
  GmapInput.prototype.drawPolygon = function (e) {
    $this = this;
    if (this.options.currentOverlay == undefined) {
      var polyOptions = {
        strokeColor: '#FFCC66',
        fillColor: '#FFCC66',
        strokeOpacity: 1.0,
        strokeWeight: 3
      };

      this.options.currentOverlay = new google.maps.Polygon(polyOptions);
      this.options.currentOverlay.setMap(this._map);

      google.maps.event.addListener(this.options.currentOverlay, 'click', function(e) {
        $this.click(e, this, 'Polygon');
      });

      this.data.addFeature('Polygon');
    }
    
    var path = this.options.currentOverlay.getPath();
    path.push(e.latLng);
    
    this.data.addCoordinate(e.latLng.lat(), e.latLng.lng());
    $(this.element).val(this.data.stringify());
  }






  // Data object. Handles manipulation of internal data.
  function GmapJSON(options) {
    this.data = [];
    
    this._currentFeature = -1;
    this.init();
  }
  
  // init function
  GmapJSON.prototype.init = function() {
  }

  // add feature
  GmapJSON.prototype.addFeature = function(featureType) {
    this._currentFeature++;
    this.data[this._currentFeature] = {
      "type": featureType,
      "coordinates": []
    };
    return this._currentFeature;
  }
  
  // remove feature
  GmapJSON.prototype.removeFeature = function (featurePos) {
    if (this.data[featurePos] != undefined) {
      this.data.splice(featurePos, 1);
      return true;
    }
    return false;
  }

  // set current feature
  GmapJSON.prototype.setCurrentFeature = function (featurePos) {
    if (this.data[featurePos] != undefined) {
      this._currentFeature = featurePos;
      return true;
    }
    return false;
  }

  // add coordinate
  GmapJSON.prototype.addCoordinate = function(lat, lon, featurePos) {
    if (featurePos == undefined) {
      featurePos = this._currentFeature;
    }
    
    this.data[featurePos].coordinates.push([lat, lon]);
  }
  
  // remove coordinate
  GmapJSON.prototype.removeCoordinate = function(featurePos, position) {
  
  }

  // Return current feature's coordinates
  GmapJSON.prototype.currentFeature = function() {
    return this.data[this._currentFeature]["coordinates"];
  }

  // stringify. Returns a string based on internal data.
  GmapJSON.prototype.stringify = function() {
    if (this.data.length == 0) {
      return '';
    } else if (this.data.length == 1) {
      return JSON.stringify(this.data[0]);
    } else {
      return JSON.stringify({
        type: "GeometryCollection",
        geometries: this.data
      });
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

