// Simple Feature Manager

function FeatureManager(options) {
  var defaults = {
    "map": undefined
  };
  
  this.options = $.extend( {}, defaults, options);  
  this.init();
}

FeatureManager.prototype.init = function() {
  if (this.options.map == undefined) {
   throw "Map must be defined"; 
  }
  
  this._map = this.options.map;
  this._features = {};
  this._currentFeatureID = undefined;
  this._featureIterator = 0;
}

FeatureManager.prototype.addFeature = function(feature) {
  feature.setMap(this._map);
  this._featureIterator++;
  this._features[this._featureIterator] = feature;

  return this._featureIterator;
}

FeatureManager.prototype.removeFeature = function(featureID) {
  this._features[featureID].setMap(null);
  this._features[featureID] = undefined;
}

FeatureManager.prototype.removeAllFeatures = function() {
  for (var i in this._features) {
    this._features[i].setMap(null);
  }
  this._features = new Array();
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

FeatureManager.prototype.getStats = function() {
  
}
