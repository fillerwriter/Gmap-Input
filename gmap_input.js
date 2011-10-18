/*!
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

    this._defaults = defaults;
    this._name = pluginName;
    this._map = null;

    this.init();
  }

  GmapInput.prototype.init = function () {
    this._mapcontainer = $(this.element).after('<div class="gmapInputMap"></div>').siblings('.gmapInputMap').get(0);
    var start = new google.maps.LatLng(this.options.startPoint.lat, this.options.startPoint.lon);
    var mapOptions = {
      zoom: this.options.startPoint.zoom,
      center: start,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDoubleClickZoom: true
    };

    var polyOptions = {
      strokeColor: '#FFCC66',
      fillColor: '#FFCC66',
      strokeOpacity: 1.0,
      strokeWeight: 3
    };

    this._map = new google.maps.Map(this._mapcontainer, mapOptions);
    google.maps.event.addListener(this._map, 'click', function(e) {
      var path = poly.getPath();
      path.push(e.latLng);
    });

    poly = new google.maps.Polygon(polyOptions);
    poly.setMap(this._map);

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


    // TMP TEST INFO
    var internalData = new GmapJSON();
    internalData.addFeature('Polygon');
    internalData.addCoordinate(40, 20);
    internalData.addCoordinate(50, 30);
    internalData.addFeature('Point');
    internalData.addCoordinate(30, 50);
    $(this.element).val(internalData.stringify());
  };

  // Returns map object.
  GmapInput.prototype.getMap = function () {
    return this._map;
  }

  // General click callback.
  GmapInput.prototype.click = function () {
    
  }

  // General doubleclick callback.
  GmapInput.prototype.doubleclick = function () {
    
  }

  // Switch drawing setting to polygon drawing
  GmapInput.prototype.startPolygon = function () {
    
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
    return JSON.stringify(this.data);
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

/*(function( $ ){
  var optionDefaults = {
    
  };
  
  var dblClickTimer = undefined;

  $.fn.gmapInput = function(optionOverrides) {
    var items = $(this);

    items.each(function(index, element) {
      var options = optionDefaults;
      
      if (optionOverrides) {
        $.extend(options, optionOverrides);
      }

      var map_id = 'mapinput_' + index;
      var map_container = $('<div>').attr('id', map_id).attr('style', 'width: 500px; height: 500px');
      $(element).after(map_container);
      
      var start = new google.maps.LatLng(options.startPoint.lat, options.startPoint.lon);
      var myOptions = {
        zoom: options.startPoint.zoom,
        center: start,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDoubleClickZoom: true
      };

      map = new google.maps.Map(document.getElementById(map_id), myOptions);

      // Generates control
      generateControl(map, options);

      // 'Global' states
      var mapState = MAP_STATE_PANNING;
      var drawType = DRAW_POINT;

      var polyOptions = {
        strokeColor: '#FFCC66',
        fillColor: '#FFCC66',
        strokeOpacity: 1.0,
        strokeWeight: 3
      };

      poly = new google.maps.Polygon(polyOptions);
      poly.setMap(map);

      google.maps.event.addListener(map, 'click', mapClickHandler);
      google.maps.event.addListener(map, 'dblclick', mapDblClickHandler);
      google.maps.event.addListener(map, 'rightclick', mapDblClickHandler);
      $(document).keydown(function(event) {
        var data = $('.control').data();
        if (event.which == 46 && data.currentDrawObject != undefined) {
          data.currentDrawObject.setMap(null);
          data.currentDrawObject = undefined;
        }
      });
    });
  };

  function mapClickHandler(event) {
    dblClickTimer = setTimeout(function() {mapClickHandlerPostTimer(event);}, 200);
  }

  function mapClickHandlerPostTimer(event) {
    var data = $('.control').data();
    if (data.mapState == MAP_STATE_DRAWING) {
      switch (data.drawType) {
        case DRAW_POLY:
          widgetProcessors.polygon.mapclick(event, data);
        break;
      }
    }
  }

  function mapDblClickHandler(event) {
    clearTimeout(dblClickTimer);
    var data = $('.control').data();
    widgetProcessors.polygon.mapdoubleclick(event, data);
  }

  /**
   * Generates the dropdown widget.
   *

  function generateControl(map, options) {
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
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(drawControlContainer);

    // Data structure happens here.
    /**
     * Data structures. (http://geojson.org/geojson-spec.html)
     *  - value
     *    - [
     *      'type': (point/line/poly)
     *      'coordinates': [
     *        (array of objects, lat/lon)
     *      ],
     *    ]
     *
    $('.control', drawControlContainer).data({
      'mapState': MAP_STATE_PANNING,
      'drawType': DRAW_POINT,
      'value': {
        "type": "GeometryCollection",
        "geometries": []
      },
      'currentDrawObject': undefined,
      'currentValueID': 0, // which item in value are we targeting at the moment?
      'options': options
    });

    $('li', drawControlContainer).click(function() {
      var data = $(this).parents('.control').data();
      
      $(this).parents('.control').find('li').css('background-color', '#FFF');

      switch ($(this).text()) {
        case 'Draw Point':
          data.drawType = DRAW_POINT;
        break;
        case 'Draw Line':
          data.drawType = DRAW_LINE;
        break;
        case 'Draw Polygon':
          data.drawType = DRAW_POLY;
        break;
        case 'Draw Bounds':
          data.drawType = DRAW_BOUNDS;
        break;
      }
      
      if (data.mapState == MAP_STATE_PANNING) {
        data.mapState = MAP_STATE_DRAWING;
        $(this).css('background-color', '#F00');
      }
      else {
        data.mapState = MAP_STATE_PANNING;
      }
    });
  }

  /**
   * Widget Processor object holds all the code for handling click events for our map.
   *
   * Features have many different event handlers
   *  - mapclick
   *  - mapdoubleclick
   *  - featureclick
   **
  var widgetProcessors = new Object();

  widgetProcessors.polygon = {
    // click
    mapclick: function(event, data) {
      if (data.currentDrawObject == undefined) {
        var polyOptions = {
          strokeColor: '#FFCC66',
          fillColor: '#FFCC66',
          strokeOpacity: 1.0,
          strokeWeight: 3
        };

        data.currentDrawObject = new google.maps.Polygon(polyOptions);
        data.currentDrawObject.setMap(map);

        data.currentValueID = data.value.geometries.length;

        data.value.geometries[data.currentValueID] = {
          type: 'Polygon',
          coordinates: new Array()
        }

      }
      var path = data.currentDrawObject.getPath();
      path.push(event.latLng);

      data.value.geometries[data.currentValueID].coordinates.push([event.latLng.lat(), event.latLng.lng()]);

      $('textarea').val(JSON.stringify(data.value));
    },
    // Doubleclick
    mapdoubleclick: function (event, data) {
      if (data.currentDrawObject != undefined) {
        google.maps.event.addListener(data.currentDrawObject, 'click', function(event) {
          widgetProcessors.polygon.featureclick(event, data);
        });
        data.currentDrawObject = undefined;
      }
    },
    featureclick: function (event, data) {
      widgetProcessors.polygon.mapclick(event, data);
    }
  };

})( jQuery );*/
