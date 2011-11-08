// Simple Feature Manager

function FeatureManager(options) {
  var defaults = new Array(
    "map": undefined
  );
  
  this.options = $.extend( {}, defaults, options);
  this._features;
  this._currentFeatureID;
  this._map;
  
  this.init();
}

FeatureManager.prototype.init() {
  if (this.options.map == undefined) {
   throw "Map must be defined"; 
  }
  
  this._map = this.options.map;
  this._features = new Array();
  this._currentFeatureID = undefined;
}

FeatureManager.prototype.addFeature(feature) {
  feature.setMap(this._map);
  this._features.push(feature);

  return this._features.length - 1;
}

FeatureManager.prototype.removeFeature(featureID) {

}

FeatureManager.prototype.removeAllFeatures() {
  for (var i in this._features) {
    this._features[i].setMap(null);
  }
  this._features = new Array();
  this._currentFeatureID = undefined;
}

FeatureManager.prototype.setCurrentFeature(featureID) {
  
}

FeatureManager.prototype.getCurrentFeature() {
  
}

FeatureManager.prototype.getStats() {
  
}
