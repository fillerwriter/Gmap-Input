(function( $ ){
  // Constants
  var MAP_STATE_PANNING = 'panning';
  var MAP_STATE_DRAWING = 'drawing';
  
  var DRAW_POINT = 'draw point';
  var DRAW_LINE = 'draw line';
  var DRAW_POLY = 'draw polygon';
  var DRAW_BOUNDS = 'draw bounds';
  
  var FEATURE_COUNT_UNLIMITED = -1;

  var optionDefaults = {
    startPoint: {
      'lat': 41.879535,
      'lon': -87.624333,
      'zoom': 7
    },
    imagePath: 'img',
    featureMaxCount: FEATURE_COUNT_UNLIMITED
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
   */

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
     */
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
   **/
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

})( jQuery );
