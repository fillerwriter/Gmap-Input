// Simple Feature Manager

function FeatureManager(options) {
  var defaults = {
    map: undefined,
    element: undefined,
    geojson: undefined,
    forceGeoCollection: false // If true, always output GeoCollection if only one point.
  };
  
  this.options = jQuery.extend( {}, defaults, options);

  this._map = null;
  this._features = null;
  this._currentFeatureId = null;
  this._featureIterator = null;
  this._element = null;
  this._bounds = null;

  this.init();
}

FeatureManager.prototype.init = function() {
  var $this = this;
  if (this.options.map == undefined) {
   throw "Map must be defined"; 
  }

  if (this.options.element == undefined && this.options.geojson == undefined) {
   throw "Either geojson or element must be defined"; 
  }
  
  this._map = this.options.map;
  this._features = new google.maps.MVCArray();
  this._currentFeatureID = undefined;
  this._featureIterator = 0;
  this._element = this.options.element;
  this._bounds = new google.maps.LatLngBounds();

  var geojson = undefined;
  if (jQuery(this._element).val() != '') {
    geojson = jQuery.parseJSON(jQuery(this._element).val());
  } else if (this.options.geojson != undefined) {
    geojson = this.options.geojson;
  }

  if (geojson) {
    // Load geodata.
    var rawData = GeoJSON(geojson);
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

  google.maps.event.addListener(this._features, 'insert_at', function(index) {
    $this._resetInternals();
  });
  
  google.maps.event.addListener(this._features, 'remove_at', function(index, element) {
    $this._resetInternals();
  });
  
  google.maps.event.addListener(this._features, 'set_at', function(index, element) {
    $this._resetInternals();
  });
}

FeatureManager.prototype.addFeature = function(feature) {
  // determine bounds.
  var localBounds = new google.maps.LatLngBounds();
  if (feature.getPath) {
    var path = feature.getPath();
    path.forEach(function(element, index) {
      localBounds.extend(element);
    });
  } else if (feature.getPosition) {
    localBounds.extend(feature.getPosition());
  }
  feature.set('localBounds', localBounds);
  feature.set('fmPos', this._features.getLength());

  this._features.push(feature);
  this._bounds.union(localBounds);
  feature.setMap(this._map);
}

FeatureManager.prototype.modifyFeature = function(feature, featureID) {
  var currentFeature = this._features.getAt(featureID);
  // determine bounds.
  var localBounds = new google.maps.LatLngBounds();
  if (feature.getPath) {
    var path = feature.getPath();
    path.forEach(function(element, index) {
      localBounds.extend(element);
    });
  } else if (feature.getPosition) {
    localBounds.extend(feature.getPosition());
  }
  feature.set('localBounds', localBounds);
  this._features.setAt(featureID, feature);
}

FeatureManager.prototype.removeFeatureAt = function(featureID) {
  var feature = this._features.getAt(featureID);
  feature.setMap(null);
  this._features.removeAt(featureID);
}

FeatureManager.prototype.removeAllFeatures = function() {
  for (var i in this._features) {
    this._features[i].setMap(null);
  }
  this._features = new google.maps.MVCArray();
  this._currentFeatureID = undefined;
}

// If a feature is added, modified, or removed from our internal array, we need
// to manage some internal properties to make sure everything works as expected.
FeatureManager.prototype._resetInternals = function() {
  var $this = this;
  this._bounds = new google.maps.LatLngBounds();
  this._features.forEach(function(element, i) {
    $this._bounds.union(element.get('localBounds'));
    element.set('fmPos', i);
  });
}

FeatureManager.prototype.setCurrentFeature = function(featureID) {
  this._currentFeatureID = featureID;
}

FeatureManager.prototype.getCurrentFeature = function() {
  if (this._currentFeatureID != null) {
    return this._features.getAt(this._currentFeatureID);
  } else {
    return undefined;
  }
}

FeatureManager.prototype.getFeatureAt = function(featureID) {
  return this._features.getAt(featureID);
}

FeatureManager.prototype.getFeatures = function() {
  // NOTE: If the returning array is modified, we can't guarantee no errors.
  return this._features.getArray();
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

FeatureManager.prototype.getBounds = function() {
  return this._bounds;
}

FeatureManager.prototype.getGeoJSON = function() {
  var geoJSON = {};
  var $this = this;
  if (this._features.getLength() == 0) {
    
  } else if (this.options.forceGeoCollection == false && this._features.getLength() == 1) {
    geoJSON = this._GeoJSONParse(this.features.getAt(0));
  } else {
    var geometries = new Array();
    this._features.forEach(function(element, i) {
      geometries.push($this._GeoJSONParse(element));
    });
    geoJSON = {
      type: "GeometryCollection",
      geometries: geometries
    }
  }
  return geoJSON;
}

// takes a single google overlay element, returns geojson snippet
FeatureManager.prototype._GeoJSONParse = function(element) {
  var $this = this;
  var properties = element.get('geojsonProperties');
  if (element.getPaths) {
    var paths = element.getPaths();
    var coordinates = new Array();
    paths.forEach(function(path, i) {
      var sub = new Array();
      path.forEach(function(coor, j) {
        sub.push([coor.lng(), coor.lat()]);
      });
      coordinates.push(sub);
    });
    return {
      type: "Polygon",
      coordinates: coordinates,
      properties: properties
    }
  } else if (element.getPath) {
    var path = element.getPath();
    var coordinates = new Array();
    path.forEach(function(position, i) {
      coordinates.push(position.lng(), position.lat());
    });
    return {
      type: "LineString",
      coordinates: coordinates,
      properties: properties
    }
  } else if (element.getPosition) {
    var pos = element.getPosition();
    return {
      type: "Point",
      coordinates: [pos.lng(), pos.lat()],
      properties: properties
    }
  }
}
