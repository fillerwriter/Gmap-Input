// Abstract class for features.
// We do this so that we can keep a state with our features. Namely, if we're editing it or not.
// For now, to reduce complexity we are only thinking about polylines and simple polygons.

// constants
var GMAP_EDIT_STATE_EDIT = 'edit';
var GMAP_EDIT_STATE_STATIC = 'static';

function GmapFeatureEdit(options) {
  var defaults = {
    'feature': undefined,
    'static': {
      'strokeColor': '#FF0000',
      'strokeOpacity': 0.8,
      'strokeWeight': 2,
      'fillColor': '#FF0000',
      'fillOpacity': 0.35
    },
    'edit': {
      'strokeColor': '#00FF00',
      'strokeOpacity': 0.8,
      'strokeWeight': 2,
      'fillColor': '#00FF00',
      'fillOpacity': 0.35
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
  
  this._feature.setOptions(this.options['static']);
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
