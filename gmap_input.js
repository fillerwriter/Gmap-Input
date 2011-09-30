(function( $ ){
  // Constants
  var MAP_STATE_PANNING = 'panning';
  var MAP_STATE_DRAWING = 'drawing';
  
  var DRAW_POINT = 'draw point';
  var DRAW_LINE = 'draw line';
  var DRAW_POLY = 'draw polygon';
  var DRAW_BOUNDS = 'draw bounds';
  
  // 'Global' states
  var mapState = MAP_STATE_PANNING;
  var drawType = DRAW_POINT;
  
  var optionDefaults = {
    startPoint: {
      'lat': 41.879535,
      'lon': -87.624333,
      'zoom': 7
    }
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
      
      var drawControlContainer = document.createElement('DIV');
      var drawControl = $('<div>').text('test');
      drawControlContainer.innerHTML = drawControl.html();
      map.controls[google.maps.ControlPosition.TOP_RIGHT].push(drawControlContainer);
      
      var polyOptions = {
        strokeColor: '#000000',
        fillColor: '#333333',
        strokeOpacity: 1.0,
        strokeWeight: 3
      };
      poly = new google.maps.Polygon(polyOptions);
      poly.setMap(map);
      
      google.maps.event.addListener(map, 'click', addLatLng);
      
      function addLatLng(event) {
        var path = poly.getPath();
        
        path.push(event.latLng);
        
        var marker = new google.maps.Marker({
          position: event.latLng,
          title: '#' + path.getLength(),
          map: map
        });
      }
    });
  };

})( jQuery );
