(function( $ ){
  // Constants
  var MAP_STATE_PANNING = 'panning';
  var MAP_STATE_DRAWING = 'drawing';
  
  var DRAW_POINT = 'draw point';
  var DRAW_LINE = 'draw line';
  var DRAW_POLY = 'draw polygon';
  var DRAW_BOUNDS = 'draw bounds';
  
  var FEATURE_COUNT_UNLIMITED = -1;
  
  // 'Global' states
  var mapState = MAP_STATE_PANNING;
  var drawType = DRAW_POINT;
  
  var optionDefaults = {
    startPoint: {
      'lat': 41.879535,
      'lon': -87.624333,
      'zoom': 7
    },
    imagePath: 'img',
    featureMaxCount: FEATURE_COUNT_UNLIMITED
  };

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
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById(map_id), myOptions);

      generateControl(map);

      var polyOptions = {
        strokeColor: '#FFCC66',
        fillColor: '#FFCC66',
        strokeOpacity: 1.0,
        strokeWeight: 3
      };
      poly = new google.maps.Polygon(polyOptions);
      poly.setMap(map);
      
      google.maps.event.addListener(map, 'click', addLatLng);
      
      function addLatLng(event) {
        var path = poly.getPath();
        
        path.push(event.latLng);
        
        var handle = new google.maps.MarkerImage(options.imagePath + '/point-handle.png',
          new google.maps.Size(15, 15),
          new google.maps.Point(0, 0),
          new google.maps.Point(7.5, 7.5)
        );

        var marker = new google.maps.Marker({
          position: event.latLng,
          title: '#' + path.getLength(),
          map: map,
          icon: handle
        });
      }
    });
  };

  /**
   * Generates the dropdown widget.
   */

  function generateControl(map) {
    var drawControlContainer = document.createElement('DIV');
    var list = $('<ul>').css({
      'background-color': '#FFF',
      'list-style': 'none',
      'padding-left': 0
    })
      .html('<li>Draw Point</li><li>Draw Line</li><li>Draw Polygon</li><li>Draw Bounds</li>');
    
    var drawControl = $('<div>').append(list);
    drawControlContainer.innerHTML = drawControl.html();
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(drawControlContainer);
    
    $('li', drawControlContainer).click(function() {
      // @TODO: Toggle drawing status here.
      alert("HI");
    });
  }

  var widgetProcessors = new Object();

  function runFunction(name, arguments)
  {
    var fn = window[name];
    if(typeof fn !== 'function')
      return;

    fn.apply(window, arguments);
  }

})( jQuery );
