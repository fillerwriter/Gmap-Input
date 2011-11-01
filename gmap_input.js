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
    this._features;

    this.init();
  }

  GmapInput.prototype.init = function () {
    var $this = this;
    this.options.mapState = MAP_STATE_PANNING;
    this.options.currentFeatureType = DRAW_POINT;
    this.options.currentOverlay = undefined;
    this.options.dblClickTimer = undefined;
    this._features = new Array();

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

    google.maps.event.addListener(this._map, 'dblclick', function(e) {
      $this.doubleclick(e);
    });

    // Load data from element's value.
    if ($(this.element).val() != '') {
      try {
        var myData = jQuery.parseJSON($(this.element).val());
        if (myData) {
          this.data.loadGeoJSON(myData);
          
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
                  this.drawPolygon(myData.geometries[i].coordinates);
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
                this.drawPolygon(myData.coordinates);
              break;
            }
          }
        }
      } catch(e) {
      }
    }

    // reset back to no current polygon if we've loaded data
    this.options.currentOverlay = undefined;

    var drawControlContainer = document.createElement('DIV');
    var list = $('<ul>').addClass('control').css({
      'background-color': '#FFF',
      'list-style': 'none',
      'padding-left': 0,
      'float': 'left',
      'font-family': '"Helvetica", sans-serif',
      'font-size': '0.8em',
      'margin': 0
    })
      .html('<ul class="current"><li>Draw Point</li></ul><ul class="options"><li>Draw Line</li><li>Draw Polygon</li><li>Draw Bounds</li></ul>');

    var drawControl = $('<div>').append(list).append('<div class="dropdown">expand</div>').css({
      'background': '#FFF',
      'border': '1px solid #7895d7',
      'cursor': 'pointer',
      'box-shadow': '1px 1px 2px #999',
      'margin': '5px 5px 0 0',
      'padding': '3px',
      'overflow': 'hidden'
    });
    $('.dropdown', drawControl).css({
      'background': 'url(' + this.options.imagePath + '/dropdown.png) center center no-repeat',
      'border-left': '1px solid #000',
      'cursor': 'pointer',
      'display': 'block',
      'float': 'left',
      'height': '11px',
      'text-indent': '-9999px',
      'width': '16px'
    });

    $('ul', drawControl).css({
      'list-style': 'none',
      'margin': 0,
      'padding': 0
    });

    $('li', drawControl).css({
      'width': '7em'
    });

    $('.options', drawControl).hide();

    drawControlContainer = drawControl.get(0);
    this._map.controls[google.maps.ControlPosition.TOP_RIGHT].push(drawControlContainer);

    $('li', drawControlContainer).click(function () {
      var draw_options = new Object();
      draw_options[DRAW_POINT] = 'Draw Point';
      draw_options[DRAW_LINE] = 'Draw Line';
      draw_options[DRAW_POLY] = 'Draw Polygon';
      draw_options[DRAW_BOUNDS] = 'Draw Bounds';

      $(this).parent().parent().find('li').css({
        'background-color': '#FFF',
        'color': '#000'
      });

      if ($(this).text() == draw_options[$this.options.currentFeatureType]) {
        if ($this.options.mapState == MAP_STATE_DRAWING) {
          $this.options.mapState = MAP_STATE_PANNING;
        } else {
          $this.options.mapState = MAP_STATE_DRAWING;
          $(this).css({
            'background-color': '#7895d7',
            'color': '#FFF'
          });
        }
      } else {
        $this.options.mapState = MAP_STATE_DRAWING;
        $(this).css({
          'background-color': '#7895d7',
          'color': '#FFF'
        });
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

      $this.options.currentOverlay.setEditState(GMAP_EDIT_STATE_STATIC);
      $this.options.currentOverlay = undefined;
    });

    $('.dropdown', drawControlContainer).click(function () {
      $('.options').slideToggle('fast');
    });
  };

  // Returns map object.
  GmapInput.prototype.getMap = function () {
    return this._map;
  }

  // General click callback.
  GmapInput.prototype.click = function (e, feature, featureType) {
    if (this.options.mapState == MAP_STATE_DRAWING) {
      switch (this.options.currentFeatureType) {
        case DRAW_POINT:
          this.drawPoint(new Array(e.latLng.lat(), e.latLng.lng()));
        break;
        case DRAW_LINE:
          if (this.options.currentOverlay == undefined) {
            this.drawLine(new Array(new Array(e.latLng.lat(), e.latLng.lng())));
          } else {
            this.appendPoint(new Array(e.latLng.lat(), e.latLng.lng()));
          }
        break;
        case DRAW_POLY:
          if (this.options.currentOverlay == undefined) {
            this.drawPolygon(new Array(new Array(e.latLng.lat(), e.latLng.lng())));
          } else {
            this.appendPoint(new Array(e.latLng.lat(), e.latLng.lng()));
          }
        break;
        case DRAW_BOUNDS:
          // @TODO: Add bounds response. But not here, in a mouse down/up callback. Bleh...
        break;
      }
    } else {
      if (feature != undefined) {
        // Panning mode + a polygon == select a polygon.
        // @TODO: Create way to select/deselect items.
        this.options.currentOverlay = feature;
        this.options.currentFeatureType = featureType;
        this.options.currentOverlay._setStateEdit();
      } else {
        // Panning mode + no polygon == deselect polygon
        this.options.currentOverlay._setStateStatic();
        this.options.currentOverlay = undefined;
      }
    }
  }

  // General doubleclick callback.
  GmapInput.prototype.doubleclick = function (e, feature, featureType) {
    alert("HI");
  }

  // Switch drawing setting to point drawing
  GmapInput.prototype.drawPoint = function (coordinate) {
    $this = this;
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(coordinate[0], coordinate[1]),
      map: this._map
    });

    google.maps.event.addListener(marker, 'click', function(e) {
      $this.click(e, this, 'Point');
    });

    google.maps.event.addListener(marker, 'dblclick', function(e) {
      $this.doubleclick(e, this, 'Point');
    });

    this.data.addFeature('Point');
    this.data.addCoordinate(coordinate[0], coordinate[1]);
    $(this.element).val(this.data.stringify());
  }

  // Switch drawing setting to line drawing
  GmapInput.prototype.drawLine = function (coordinates) {
    $gmapinput = this;

    this.options.currentOverlay = new GmapFeatureEdit({
      feature: new google.maps.Polyline()
    });
    this.options.currentOverlay.setMap(this._map);
    this.options.currentOverlay._setStateEdit();

    google.maps.event.addListener(this.options.currentOverlay, 'click', function(e) {
      $gmapinput.click(e, this, 'Line');
    });

    google.maps.event.addListener(this.options.currentOverlay, 'dblclick', function(e) {
      $gmapinput.doubleclick(e, this, 'Line');
    });

    this.data.addFeature('LineString');

    for (var i in coordinates) {
      this.appendPoint(coordinates[i]);
    }
  }

  // Switch drawing setting to polygon drawing
  GmapInput.prototype.drawPolygon = function (coordinates) {
    $gmapinput = this;

    var poly = new GmapFeatureEdit({
      feature: new google.maps.Polygon()
    });

    this.options.currentOverlay = poly;
    this.options.currentOverlay.setMap(this._map);
    this.options.currentOverlay._setStateEdit();

    google.maps.event.addListener(poly, 'click', function(e) {
      var path = this.getPath();
      var item = path.getAt(0);
      alert("DRAW PROTOTYPE: " + item.lat());
      $gmapinput.click(e, this, 'Polygon');
    });

    google.maps.event.addListener(this.options.currentOverlay, 'dblclick', function(e) {
      $gmapinput.doubleclick(e, this, 'Polygon');
    });

    this.data.addFeature('Polygon');

    for (var i in coordinates) {
      this.appendPoint(coordinates[i]);
    }
  }

  // Add coordinate to current feature. Really only applicable to lines and polygons
  GmapInput.prototype.appendPoint = function(coordinate) {
    if (this.options.currentOverlay != undefined) {
      var path = this.options.currentOverlay.getPath();
      path.push(new google.maps.LatLng(coordinate[0], coordinate[1]));

      this.data.addCoordinate(coordinate[0], coordinate[1]);
      $(this.element).val(this.data.stringify());
    }
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

  // Load valid GeoJSON. Takes an GeoJSON object.
  GmapJSON.prototype.loadGeoJSON = function(newData) {
    if (newData.type == 'GeometryCollection') {
      this.data = newData.geometries;
    } else {
      this.data = new Array(newData);
    }
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
    if (this.data[featurePos].type == 'Point') {
      this.data[featurePos].coordinates = [lat, lon];
    } else {
      this.data[featurePos].coordinates.push([lat, lon]);
    }
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

  // Get. Returns a GeoJSON object with current data.
  GmapJSON.prototype.get = function() {
    if (this.data.length == 0) {
      return undefined;
    } else if (this.data.length == 1) {
      return this.data[0];
    } else {
      return {
        type: "GeometryCollection",
        geometries: this.data
      };
    }
  }



  // Abstract class for features.
  // We do this so that we can keep a state with our features. Namely, if we're editing it or not.
  // For now, to reduce complexity we are only thinking about polylines and simple polygons.
  
  // constants
  var GMAP_EDIT_STATE_EDIT = 'edit';
  var GMAP_EDIT_STATE_STATIC = 'static';
  
  function GmapFeatureEdit(options) {
    var defaults = {
      feature: undefined,
      static: {
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35
      },
      edit: {
        strokeColor: "#00FF00",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#00FF00",
        fillOpacity: 0.35
      }
    };
    
    this.options = $.extend( {}, defaults, options);

    if (this.options.feature == undefined) {
      throw "Gmap Feature must be defined";
    }

    this._state;
    this._feature;
    this._points;

    this.init();
  }

  // init function.
  GmapFeatureEdit.prototype.init = function() {
    $this = this;
    this._feature = this.options.feature;
    this._state = GMAP_EDIT_STATE_STATIC;
    this._path = this._feature.getPath();
    this._points = new Array();

    this._feature.setOptions(this.options[this._state]);

    google.maps.event.addListener(this._path, 'insert_at', function(i) {
      $this._pathInsertCallback(i);
    });

    google.maps.event.addListener(this._feature, 'click', function(e) {
      var path = this.getPath();
      var item = path.getAt(0);
      alert("GMAP FEATURE: " + item.lat());
      google.maps.event.trigger($this, 'click', e);
    });

    google.maps.event.addListener(this._feature, 'dblclick', function() {
      google.maps.event.trigger($this, 'dblclick');
    });
  }

  // getMap
  GmapFeatureEdit.prototype.getMap = function(map) {
    return this._feature.getMap();
  }

  // setMap
  GmapFeatureEdit.prototype.setMap = function(map) {
    this._feature.setMap(map);
  }

  // getPath
  GmapFeatureEdit.prototype.getPath = function() {
    return this._feature.getPath();
  }

  // setPath
  GmapFeatureEdit.prototype.setPath = function(newPath) {
    this._path = newPath;
  }

  // getEditState
  GmapFeatureEdit.prototype.getEditState = function() {
    return this._state;
  }

  // setEditState
  GmapFeatureEdit.prototype.setEditState = function(newEditState) {
    if (newEditState == GMAP_EDIT_STATE_EDIT) {
      this._setStateEdit();
    } else if (newEditState == GMAP_EDIT_STATE_STATIC) {
      this._setStateStatic();
    } else {
      throw "Bad edit state option";
    }
  }

  //_setStateEdit
  GmapFeatureEdit.prototype._setStateEdit = function() {
    for (var i in this._points) {
      this._points[i].setVisible(true);
    }
    
    this._feature.setOptions(this.options.edit);
  }

  //_setStateStatic
  GmapFeatureEdit.prototype._setStateStatic = function() {
    for (var i in this._points) {
      this._points[i].setVisible(false);
    }
    
    this._feature.setOptions(this.options.static);
  }
  
  // _pathInsertCallback
  GmapFeatureEdit.prototype._pathInsertCallback = function(i) {
    var image = new google.maps.MarkerImage('img/point-handle.png',
      new google.maps.Size(15, 15),
      new google.maps.Point(0, 0),
      new google.maps.Point(8, 8)
    );

    var map = $this._feature.getMap();
    var marker = new google.maps.Marker({
      position: this._path.getAt(i),
      map: map,
      icon: image
    });

    this._points.push(marker);
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

