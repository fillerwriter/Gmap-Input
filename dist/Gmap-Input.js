(function(a,b,e,l){function d(n,j){this.element=n;this.options=a.extend({},g,j);this._defaults=g;this._name=i;this._features=this._dblClickTimer=this._drawManager=this._bounds=this._mapcontainer=this._map=null;this.init()}var i="gmapInput",g={startPoint:{lat:41.879535,lon:-87.624333,zoom:7},imagePath:"img",featureMaxCount:-1,widgetOptions:{},defaultWidgetOption:"dummy",mapOptions:{mapTypeId:google.maps.MapTypeId.ROADMAP}};d.prototype.init=function(){function n(a){selectedShape=a;a.setEditable(true)}
var j=this;this.options.mapState="panning";this.options.currentFeatureType="dummy";this._dblClickTimer=l;this._mapcontainer=a(this.element).after('<div class="gmapInputMap"></div>').siblings(".gmapInputMap").get(0);var b={zoom:this.options.startPoint.zoom,center:new google.maps.LatLng(this.options.startPoint.lat,this.options.startPoint.lon),mapTypeId:this.options.mapOptions.mapTypeId,disableDoubleClickZoom:true};this._map=new google.maps.Map(this._mapcontainer,b);this._features=new FeatureManager({map:this._map,
element:this.element});this._features.getLength()>0&&this._map.fitBounds(this._features.getBounds());this._drawManager=new google.maps.drawing.DrawingManager({map:this._map,drawingControlOptions:{drawingModes:[google.maps.drawing.OverlayType.MARKER,google.maps.drawing.OverlayType.POLYLINE,google.maps.drawing.OverlayType.POLYGON],position:google.maps.ControlPosition.TOP_LEFT},markerOptions:{draggable:true},polylineOptions:{editable:true}});google.maps.event.addListener(this._map,"click",function(a){j.click(a)});
google.maps.event.addListener(this._drawManager,"overlaycomplete",function(b){var c=b.overlay;j._features.addFeature(c);a(j.element).val(JSON.stringify(j._features.getGeoJSON()));if(b.type!=google.maps.drawing.OverlayType.MARKER)this.setDrawingMode(null),j._features.setCurrentFeature(c.get("fmPos")),c.type=b.type,b.type=="polygon"&&(b=c.getPath(),google.maps.event.addListener(b,"insert_at",function(){var a=j._features.getCurrentFeature();j._features.modifyFeature(a,a.get("fmPos"))})),google.maps.event.addListener(c,
"click",function(){j._features.setCurrentFeature(c.get("fmPos"));n(c)}),n(c)})};d.prototype.version=function(){return"0.2"};d.prototype.getMap=function(){return this._map};d.prototype.click=function(a,b,e){var f=this;this._dblClickTimer=setTimeout(function(){f._click(a,b,e)},200)};d.prototype._click=function(b,j){j==l&&(this._features.getCurrentFeature().setEditable(false),this._features.setCurrentFeature(null),a(this.element).val(JSON.stringify(this._features.getGeoJSON())))};d.prototype.doubleclick=
function(b,j){clearTimeout(this._dblClickTimer);var e=this._features.getCurrentFeature();e!=l?(this.appendPoint([b.latLng.lng(),b.latLng.lat()]),e.setEditState(GMAP_EDIT_STATE_STATIC),this._features.setCurrentFeature(null)):j!=l&&(e=j.getFeatureID(),j.setMap(null),this.data.removeFeature(e),a(this.element).val(this.data.stringify()))};d.prototype.rightclick=function(){};d.prototype.mouseup=function(b,e){this.data.replaceCoordinate(b.latLng.lng(),b.latLng.lat(),b.featureID,e.getFeatureID()-1);a(this.element).val(this.data.stringify())};
a.fn[i]=function(b){return this.each(function(){a.data(this,"plugin_"+i)||a.data(this,"plugin_"+i,new d(this,b))})}})(jQuery,window,document);var GeoJSON=function(a,b){var e=function(a,b,d){var f;switch(a.type){case "Point":b.position=new google.maps.LatLng(a.coordinates[1],a.coordinates[0]);f=new google.maps.Marker(b);d&&f.set("geojsonProperties",d);break;case "MultiPoint":f=[];for(var c=0;c<a.coordinates.length;c++)b.position=new google.maps.LatLng(a.coordinates[c][1],a.coordinates[c][0]),f.push(new google.maps.Marker(b));if(d)for(var h=0;h<f.length;h++)f[h].set("geojsonProperties",d);break;case "LineString":for(var g=[],c=0;c<a.coordinates.length;c++){var h=
a.coordinates[c],i=new google.maps.LatLng(h[1],h[0]);g.push(i)}b.path=g;f=new google.maps.Polyline(b);d&&f.set("geojsonProperties",d);break;case "MultiLineString":f=[];for(c=0;c<a.coordinates.length;c++){for(var g=[],k=0;k<a.coordinates[c].length;k++)h=a.coordinates[c][k],i=new google.maps.LatLng(h[1],h[0]),g.push(i);b.path=g;f.push(new google.maps.Polyline(b))}if(d)for(h=0;h<f.length;h++)f[h].set("geojsonProperties",d);break;case "Polygon":for(var m=[],c=0;c<a.coordinates.length;c++){g=[];for(k=
0;k<a.coordinates[c].length;k++)i=new google.maps.LatLng(a.coordinates[c][k][1],a.coordinates[c][k][0]),g.push(i);m.push(g)}b.paths=m;f=new google.maps.Polygon(b);d&&f.set("geojsonProperties",d);break;case "MultiPolygon":f=[];for(c=0;c<a.coordinates.length;c++){m=[];for(k=0;k<a.coordinates[c].length;k++){g=[];for(h=0;h<a.coordinates[c][k].length;h++)i=new google.maps.LatLng(a.coordinates[c][k][h][1],a.coordinates[c][k][h][0]),g.push(i);m.push(g)}b.paths=m;f.push(new google.maps.Polygon(b))}if(d)for(h=
0;h<f.length;h++)f[h].set("geojsonProperties",d);break;case "GeometryCollection":f=[];if(a.geometries)for(c=0;c<a.geometries.length;c++)f.push(e(a.geometries[c],b,d||null));else f=l('Invalid GeoJSON object: GeometryCollection object missing "geometries" member.');break;default:f=l('Invalid GeoJSON object: Geometry object must be one of "Point", "LineString", "Polygon" or "MultiPolygon".')}return f},l=function(a){return{type:"Error",message:a}},d,i=b||{};switch(a.type){case "FeatureCollection":if(a.features){d=
[];for(var g=0;g<a.features.length;g++)d.push(e(a.features[g].geometry,i,a.features[g].properties))}else d=l('Invalid GeoJSON object: FeatureCollection object missing "features" member.');break;case "GeometryCollection":if(a.geometries){d=[];for(g=0;g<a.geometries.length;g++)d.push(e(a.geometries[g],i,a.geometries[g].properties))}else d=l('Invalid GeoJSON object: GeometryCollection object missing "geometries" member.');break;case "Feature":d=!a.properties||!a.geometry?l('Invalid GeoJSON object: Feature object missing "properties" or "geometry" member.'):
e(a.geometry,i,a.properties);break;case "Point":case "MultiPoint":case "LineString":case "MultiLineString":case "Polygon":case "MultiPolygon":d=a.coordinates?d=e(a,i,a.properties):l('Invalid GeoJSON object: Geometry object missing "coordinates" member.');break;default:d=l('Invalid GeoJSON object: GeoJSON object must be one of "Point", "LineString", "Polygon", "MultiPolygon", "Feature", "FeatureCollection" or "GeometryCollection".')}return d};function FeatureManager(a){this.options=jQuery.extend({},{map:void 0,element:void 0,geojson:void 0,forceGeoCollection:false},a);this._bounds=this._element=this._featureIterator=this._currentFeatureId=this._features=this._map=null;this.init()}
FeatureManager.prototype.init=function(){var a=this;if(this.options.map==void 0)throw"Map must be defined";if(this.options.element==void 0&&this.options.geojson==void 0)throw"Either geojson or element must be defined";this._map=this.options.map;this._features=new google.maps.MVCArray;this._currentFeatureID=void 0;this._featureIterator=0;this._element=this.options.element;this._bounds=new google.maps.LatLngBounds;var b=void 0;if(jQuery(this._element).val()!="")b=jQuery.parseJSON(jQuery(this._element).val());
else if(this.options.geojson!=void 0)b=this.options.geojson;if(b)if(b=GeoJSON(b),b.type=="Error")alert("ERROR");else if(jQuery.isArray(b))for(var e in b)this.addFeature(b[e]);else this.addFeature(b);google.maps.event.addListener(this._features,"insert_at",function(){a._resetInternals()});google.maps.event.addListener(this._features,"remove_at",function(){a._resetInternals()});google.maps.event.addListener(this._features,"set_at",function(){a._resetInternals()})};
FeatureManager.prototype.addFeature=function(a){var b=new google.maps.LatLngBounds;a.getPath?a.getPath().forEach(function(a){b.extend(a)}):a.getPosition&&b.extend(a.getPosition());a.set("localBounds",b);a.set("fmPos",this._features.getLength());this._features.push(a);this._bounds.union(b);a.setMap(this._map)};
FeatureManager.prototype.modifyFeature=function(a,b){this._features.getAt(b);var e=new google.maps.LatLngBounds;a.getPath?a.getPath().forEach(function(a){e.extend(a)}):a.getPosition&&e.extend(a.getPosition());a.set("localBounds",e);this._features.setAt(b,a)};FeatureManager.prototype.removeFeatureAt=function(a){this._features.getAt(a).setMap(null);this._features.removeAt(a)};
FeatureManager.prototype.removeAllFeatures=function(){for(var a in this._features)this._features[a].setMap(null);this._features=new google.maps.MVCArray;this._currentFeatureID=void 0};FeatureManager.prototype._resetInternals=function(){var a=this;this._bounds=new google.maps.LatLngBounds;this._features.forEach(function(b,e){a._bounds.union(b.get("localBounds"));b.set("fmPos",e)})};FeatureManager.prototype.setCurrentFeature=function(a){this._currentFeatureID=a};
FeatureManager.prototype.getCurrentFeature=function(){if(this._currentFeatureID!=null)return this._features.getAt(this._currentFeatureID)};FeatureManager.prototype.getFeatureAt=function(a){return this._features.getAt(a)};FeatureManager.prototype.getFeatures=function(){return this._features.getArray()};FeatureManager.prototype.getLength=function(){return this._features.getLength()};FeatureManager.prototype.getMap=function(){return this._map};FeatureManager.prototype.getElement=function(){return this._element};
FeatureManager.prototype.getBounds=function(){return this._bounds};FeatureManager.prototype.getGeoJSON=function(){var a={},b=this;if(this._features.getLength()!=0)if(this.options.forceGeoCollection==false&&this._features.getLength()==1)a=this._GeoJSONParse(this.features.getAt(0));else{var e=[];this._features.forEach(function(a){e.push(b._GeoJSONParse(a))});a={type:"GeometryCollection",geometries:e}}return a};
FeatureManager.prototype._GeoJSONParse=function(a){var b=a.get("geojsonProperties");if(a.getPaths){var e=[];a.getPaths().forEach(function(a){var b=[];a.forEach(function(a){b.push([a.lng(),a.lat()])});e.push(b)});return{type:"Polygon",coordinates:e,properties:b}}else if(a.getPath)return a=a.getPath(),e=[],a.forEach(function(a){e.push(a.lng(),a.lat())}),{type:"LineString",coordinates:e,properties:b};else if(a.getPosition)return a=a.getPosition(),{type:"Point",coordinates:[a.lng(),a.lat()],properties:b}};
