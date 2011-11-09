// Data object. Handles manipulation of internal data.
function GmapJSON(options) {
  this.data = [];
  
  this._currentFeature = -1;
  this.init();
}

// init function
GmapJSON.prototype.init = function() {
}

// Load valid GeoJSON. Takes an GeoJSON object.
GmapJSON.prototype.loadGeoJSON = function(newData) {
  if (newData.type == 'GeometryCollection') {
    this.data = newData.geometries;
  } else {
    if (newData.type == "Polygon") {
      this.data = new Array({
        type: "Polygon",
        "coordinates": newData.coordinates[0]
      });
    } else {
      this.data = new Array(newData);
    }
  }
}

// add feature
GmapJSON.prototype.addFeature = function(featureType) {
  this._currentFeature++;
  this.data[this._currentFeature] = {
    "type": featureType,
    "coordinates": []
  };
  return this._currentFeature;
}

// remove feature
GmapJSON.prototype.removeFeature = function (featurePos) {
  if (this.data[featurePos] != undefined) {
    this.data.splice(featurePos, 1);
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
    this.data[featurePos].coordinates = [lat, lon];
  } else {
    this.data[featurePos].coordinates.push([lat, lon]);
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

  this.data[featurePos].coordinates[coordinatePos] = [lat, lon];
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
  if (this.data.length == 0) {
    return undefined;
  } else if (this.data.length == 1) {
    if (this.data[0].type == "Polygon") {
      var tmp = {
        type: "Polygon",
        coordinates: new Array()
      };
      tmp.coordinates[0] = this.data[0].coordinates;
      return tmp;
    } else {
      return this.data[0];
    }
    return this.data[0];
  } else {
    var geomReturn = new Array();
    for (var i in this.data) {
      if (this.data[i].type == "Polygon") {
        var tmp = {
          type: "Polygon",
          coordinates: new Array()
        };
        tmp.coordinates[0] = this.data[i].coordinates;
        geomReturn.push(tmp);
      } else {
        geomReturn.push(this.data[i]);
      }
    }
    return {
      type: "GeometryCollection",
      geometries: geomReturn
    };
  }
}
