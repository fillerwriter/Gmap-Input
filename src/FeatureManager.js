// Simple Feature Manager

function FeatureManager(options) {
  var defaults = {
    map: undefined,
    element: undefined
  };
  
  this.options = jQuery.extend( {}, defaults, options);

  this._map = null;
  this._features = null;
  this._currentFeatureId = null;
  this._featureIterator = null;
  this._element = null;
  this._geoJsonOut = null;
  this._bounds = null;

  this.init();
}

FeatureManager.prototype.init = function() {
  if (this.options.map == undefined) {
   throw "Map must be defined"; 
  }

  if (this.options.element == undefined) {
   throw "Element must be defined"; 
  }
  
  this._map = this.options.map;
  this._features = new google.maps.MVCArray();
  this._currentFeatureID = undefined;
  this._featureIterator = 0;
  this._element = this.options.element;
  this._geoJsonOut = new GmapJSON();

  if (jQuery(this._element).val() != '') {
    // Load geodata.
    var rawData = GeoJSON(jQuery.parseJSON(jQuery(this._element).val()));
    if (rawData.type == 'Error') {
      alert("ERROR");
    } else {
      if (jQuery.isArray(rawData)) {
        for (var i in rawData) {
          this.addFeature(rawData[i]);
        }
      } else {
        this.addFeature(rawData);
      }
    }
  }
}

FeatureManager.prototype.addFeature = function(feature) {
  feature.setMap(this._map);
  this._featureIterator++;
  this._features[this._featureIterator] = feature;

  return this._featureIterator;
}

FeatureManager.prototype.removeFeature = function(featureID) {
  this._features[featureID].setMap(null);
  this._features.removeAt(featureID);
}

FeatureManager.prototype.removeAllFeatures = function() {
  for (var i in this._features) {
    this._features[i].setMap(null);
  }
  this._features = new google.maps.MVCArray();
  this._currentFeatureID = undefined;
}

FeatureManager.prototype.setCurrentFeature = function(featureID) {
  this._currentFeatureID = featureID;
}

FeatureManager.prototype.getCurrentFeature = function() {
  if (this._currentFeatureID != null) {
    return this._features[this._currentFeatureID];
  } else {
    return undefined;
  }
}

FeatureManager.prototype.getFeatureAt = function(featureID) {
  return this._features[featureID];
}

FeatureManager.prototype.getFeatures = function() {
  return this._features;
}

FeatureManager.prototype.getLength = function() {
  return this._features.getLength();
}

FeatureManager.prototype.getMap = function() {
  return this._map;
}

FeatureManager.prototype.getElement = function() {
  return this._element;
}
