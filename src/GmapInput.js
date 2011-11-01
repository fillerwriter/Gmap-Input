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
