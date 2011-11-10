// Abstract class for points.

// constants
var GMAP_EDIT_STATE_EDIT = 'edit';
var GMAP_EDIT_STATE_STATIC = 'static';

function GmapPointFeatureEdit(options) {
  var defaults = {
    'feature': undefined,
    'static': {
      'draggable': false
    },
    'edit': {
      'draggable': true
    },
    'imagePath': 'img'
  };
  
  this.options = jQuery.extend( {}, defaults, options);

  if (this.options.feature == undefined) {
    throw "Gmap Feature must be defined";
  }

  this._feature = this.options.feature;
  this._state = GMAP_EDIT_STATE_STATIC;
  this._featureID = -1;

  this.init();
}

// init function.
GmapPointFeatureEdit.prototype.init = function() {
  var $this = this;

  this._feature.setOptions(this.options[this._state]);

  google.maps.event.addListener(this._feature, 'click', function(e) {
    google.maps.event.trigger($this, 'click', e);
  });

  google.maps.event.addListener(this._feature, 'dblclick', function() {
    google.maps.event.trigger($this, 'dblclick');
  });

  google.maps.event.addListener(this._feature, 'mouseup', function(e) {
    e.featureID = 0;
    google.maps.event.trigger($this, 'mouseup', e);
  });
}

// getMap
GmapPointFeatureEdit.prototype.getMap = function(map) {
  return this._feature.getMap();
}

// setMap
GmapPointFeatureEdit.prototype.setMap = function(map) {
  this._feature.setMap(map);
}

// getPath
GmapPointFeatureEdit.prototype.getPosition = function() {
  return this._feature.getPosition();
}

// setPath
GmapPointFeatureEdit.prototype.setPosition = function(newPosition) {
  this._feature.setPosition(newPosition);
}

// getEditState
GmapPointFeatureEdit.prototype.getEditState = function() {
  return this._state;
}

// setEditState
GmapPointFeatureEdit.prototype.setEditState = function(newEditState) {
  if (newEditState == GMAP_EDIT_STATE_EDIT) {
    this._setStateEdit();
  } else if (newEditState == GMAP_EDIT_STATE_STATIC) {
    this._setStateStatic();
  } else {
    throw "Bad edit state option";
  }
}

//_setStateEdit
GmapPointFeatureEdit.prototype._setStateEdit = function() {
  this._feature.setOptions(this.options[GMAP_EDIT_STATE_EDIT]);
}

//_setStateStatic
GmapPointFeatureEdit.prototype._setStateStatic = function() {
  this._feature.setOptions(this.options[GMAP_EDIT_STATE_STATIC]);
}

GmapPointFeatureEdit.prototype.setFeatureID = function(featureID) {
  this._featureID = featureID;
}

GmapPointFeatureEdit.prototype.getFeatureID = function() {
  return this._featureID;
}