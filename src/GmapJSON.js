// Data object. Handles manipulation of internal data.
function GmapJSON(options) {
  this.data = [];
  
  this._currentFeature = -1;
  this._count = 0;
  this.init();
}

// init function
GmapJSON.prototype.init = function() {
}

// Load valid GeoJSON. Takes an GeoJSON object.
GmapJSON.prototype.loadGeoJSON = function(newData) {
  var internal = new Array();
  if (newData.type == 'GeometryCollection') {
    for (var i in newData.geometries) {
      internal.push(this._GeoJSON2Internal(newData.geometries[i]));
      this._count++;
    }
  } else {
    internal = new Array(this._GeoJSON2Internal(newData));
  }

  this.data = internal;
}

GmapJSON.prototype._internal2GeoJSON = function(feature) {
  var returnJSON = {
    type: feature.type,
    coordinates: new Array()
  };

  if (feature.type == "Point") {
    returnJSON.coordinates = feature.coordinates;
  } else if (feature.type == "LineString") {
    returnJSON.coordinates = feature.coordinates;
  } else if (feature.type == "Polygon") {
    returnJSON.coordinates = new Array(feature.coordinates);
  }

  return returnJSON;
}

GmapJSON.prototype._GeoJSON2Internal = function(feature) {
  var returnInternal = {
    type: feature.type,
    coordinates: new Array()
  };

  if (feature.type == "Point") {
    returnInternal.coordinates = feature.coordinates;
  } else if (feature.type == "LineString") {
    returnInternal.coordinates = feature.coordinates;
  } else if (feature.type == "Polygon") {
    returnInternal.coordinates = feature.coordinates[0];
  }

  return returnInternal;
}

// add feature
GmapJSON.prototype.addFeature = function(featureType) {
  this._currentFeature++;
  this._count++;
  this.data[this._currentFeature] = {
    "type": featureType,
    "coordinates": []
  };
  return this._currentFeature;
}

// remove feature
GmapJSON.prototype.removeFeature = function (featurePos) {
  if (this.data[featurePos - 1] != undefined) {
    this.data[featurePos - 1] = undefined;
    this._count--;
    return true;
  }
  return false;
}

// set current feature
GmapJSON.prototype.setCurrentFeature = function (featurePos) {
  if (this.data[featurePos] != undefined) {
    this._currentFeature = featurePos;
    return true;
  }
  return false;
}

// add coordinate
GmapJSON.prototype.addCoordinate = function(lat, lon, featurePos) {
  if (featurePos == undefined) {
    featurePos = this._currentFeature;
  }
  if (this.data[featurePos].type == 'Point') {
    this.data[featurePos].coordinates = [lon, lat];
  } else {
    this.data[featurePos].coordinates.push([lon, lat]);
  }
}

// remove coordinate
GmapJSON.prototype.removeCoordinate = function(featurePos, position) {

}

// Replace a specific coordinate on a feature.
GmapJSON.prototype.replaceCoordinate = function(lat, lon, coordinatePos, featurePos) {
  if (featurePos == undefined) {
    featurePos = this._currentFeature;
  }

  if (this.data[featurePos].type == "Point") {
    this.data[featurePos].coordinates = [lon, lat];
  } else {
    this.data[featurePos].coordinates[coordinatePos] = [lon, lat];
  }
}

// Return current feature's coordinates
GmapJSON.prototype.currentFeature = function() {
  return this.data[this._currentFeature]["coordinates"];
}

// stringify. Returns a string based on internal data.
GmapJSON.prototype.stringify = function() {
  if (this.data.length == 0) {
    return '';
  } else {
    return JSON.stringify(this.get());
  }
}

// Get. Returns a GeoJSON object with current data.
GmapJSON.prototype.get = function() {
  if (this._count == 0) {
    return undefined;
  } else if (this._count == 1) {
    return this._internal2GeoJSON(this.data[0]);
  } else {
    var geoReturn = new Array();
    for (var i in this.data) {
      if (this.data[i] != undefined) {
        geoReturn.push(this._internal2GeoJSON(this.data[i]));
      }
    }
    return {
      type: "GeometryCollection",
      geometries: geoReturn
    };
  }
}
