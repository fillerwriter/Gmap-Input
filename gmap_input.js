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
  
  $.fn.gmapInput = function() {
    var items = $(this);
    
    items.each(function(index, element) {
      var map_id = 'mapinput_' + index;
      var map_container = $('<div>').attr('id', map_id).attr('style', 'width: 500px; height: 500px');
      $(element).after(map_container);
      
      var chicago = new google.maps.LatLng(41.879535, -87.624333);
      var myOptions = {
        zoom: 7,
        center: chicago,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById(map_id), myOptions);
      
      var drawControlContainer = document.createElement('DIV');
      var drawControl = $('<div>').text('test');
      drawControlContainer.innerHTML = drawControl.html();
      map.controls[google.maps.ControlPosition.TOP_RIGHT].push(drawControlContainer);
    });
  };
})( jQuery );
