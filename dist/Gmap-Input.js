(function(a,b,i,g){function e(h,b){this.element=h;this.options=a.extend({},l,b);this.data=new GmapJSON;this._defaults=l;this._name=k;this._map=null;this.init()}var k="gmapInput",l={startPoint:{lat:41.879535,lon:-87.624333,zoom:7},imagePath:"img",featureMaxCount:-1};e.prototype.init=function(){var h=this;this.options.mapState="panning";this.options.currentFeatureType="draw point";this.options.dblClickTimer=g;this._mapcontainer=a(this.element).after('<div class="gmapInputMap"></div>').siblings(".gmapInputMap").get(0);
var b={zoom:this.options.startPoint.zoom,center:new google.maps.LatLng(this.options.startPoint.lat,this.options.startPoint.lon),mapTypeId:google.maps.MapTypeId.ROADMAP,disableDoubleClickZoom:true};this._map=new google.maps.Map(this._mapcontainer,b);this._features=new FeatureManager({map:this._map});google.maps.event.addListener(this._map,"click",function(a){h.click(a)});google.maps.event.addListener(this._map,"dblclick",function(a){h.doubleclick(a)});if(a(this.element).val()!=""){new google.maps.LatLngBounds;
try{var d=jQuery.parseJSON(a(this.element).val());if(d){this.data.loadGeoJSON(d);var c=this.data.get();if(c.type=="GeometryCollection")for(var f in c.geometries)switch(c.geometries[f].type){case "Point":this.drawPoint(c.geometries[f].coordinates);break;case "LineString":this.drawLine(c.geometries[f].coordinates);break;case "Polygon":this.drawPolygon(c.geometries[f].coordinates[0])}else switch(c.type){case "Point":this.drawPoint(c.coordinates);break;case "LineString":this.drawLine(c.coordinates);break;
case "Polygon":this.drawPolygon(c.coordinates[0])}}}catch(e){}b=this._features.getFeatures();for(f in b)b[f].setEditState(GMAP_EDIT_STATE_STATIC);this._features.setCurrentFeature(null)}f=i.createElement("DIV");f=a("<ul>").addClass("control").css({"background-color":"#FFF","list-style":"none","padding-left":0,"float":"left","font-family":'"Helvetica", sans-serif',"font-size":"0.8em",margin:0}).html('<ul class="current"><li>Draw Point</li></ul><ul class="options"><li>Draw Line</li><li>Draw Polygon</li><li>Draw Bounds</li></ul>');
f=a("<div>").append(f).append('<div class="dropdown">expand</div>').css({background:"#FFF",border:"1px solid #7895d7",cursor:"pointer","box-shadow":"1px 1px 2px #999",margin:"5px 5px 0 0",padding:"3px",overflow:"hidden"});a(".dropdown",f).css({background:"url("+this.options.imagePath+"/dropdown.png) center center no-repeat","border-left":"1px solid #000",cursor:"pointer",display:"block","float":"left",height:"11px","text-indent":"-9999px",width:"16px"});a("ul",f).css({"list-style":"none",margin:0,
padding:0});a("li",f).css({width:"7em"});a(".options",f).hide();f=f.get(0);this._map.controls[google.maps.ControlPosition.TOP_RIGHT].push(f);a("li",f).click(function(){a(this).parent().parent().find("li").css({"background-color":"#FFF",color:"#000"});a(this).text()=={"draw point":"Draw Point","draw line":"Draw Line","draw polygon":"Draw Polygon","draw bounds":"Draw Bounds"}[h.options.currentFeatureType]?h.options.mapState=="drawing"?h.options.mapState="panning":(h.options.mapState="drawing",a(this).css({"background-color":"#7895d7",
color:"#FFF"})):(h.options.mapState="drawing",a(this).css({"background-color":"#7895d7",color:"#FFF"}));switch(a(this).text()){case "Draw Point":h.options.currentFeatureType="draw point";break;case "Draw Line":h.options.currentFeatureType="draw line";break;case "Draw Polygon":h.options.currentFeatureType="draw polygon";break;case "Draw Bounds":h.options.currentFeatureType="draw bounds"}var b=h._features.getCurrentFeature();b!=g&&(b.setEditState(GMAP_EDIT_STATE_STATIC),h._features.setCurrentFeature(null))});
a(".dropdown",f).click(function(){a(".options").slideToggle("fast")})};e.prototype.version=function(){return"0.1"};e.prototype.getMap=function(){return this._map};e.prototype.click=function(a,b,d){var c=this._features.getCurrentFeature();if(this.options.mapState=="drawing")switch(this.options.currentFeatureType){case "draw point":this.drawPoint([a.latLng.lng(),a.latLng.lat()]);break;case "draw line":c==g?this.drawLine([[a.latLng.lng(),a.latLng.lat()]]):this.appendPoint([a.latLng.lng(),a.latLng.lat()]);
break;case "draw polygon":c==g?this.drawPolygon([[a.latLng.lng(),a.latLng.lat()]]):this.appendPoint([a.latLng.lng(),a.latLng.lat()])}else b!=g?(c=this._features.getCurrentFeature(),c!=g&&c.setEditState(GMAP_EDIT_STATE_STATIC),this._features.setCurrentFeature(b.getFeatureID()),this.options.currentFeatureType=d,b.setEditState(GMAP_EDIT_STATE_EDIT)):(c=this._features.getCurrentFeature(),c!=g&&c.setEditState(GMAP_EDIT_STATE_STATIC),this._features.setCurrentFeature(null))};e.prototype.doubleclick=function(){alert("HI")};
e.prototype.mouseup=function(b,j){this.data.replaceCoordinate(b.latLng.lng(),b.latLng.lat(),b.featureID,j.getFeatureID()-1);a(this.element).val(this.data.stringify())};e.prototype.drawPoint=function(b){var j=this,d=new GmapPointFeatureEdit({feature:new google.maps.Marker({position:new google.maps.LatLng(b[1],b[0])})}),c=j._features.addFeature(d);d.setFeatureID(c);d.setEditState(GMAP_EDIT_STATE_EDIT);google.maps.event.addListener(d,"click",function(a){j.click(a,this,"Point")});google.maps.event.addListener(d,
"dblclick",function(a){j.doubleclick(a,this,"Point")});google.maps.event.addListener(d,"mouseup",function(a){j.mouseup(a,this,"Point")});this.data.addFeature("Point");this.data.addCoordinate(b[1],b[0]);a(this.element).val(this.data.stringify())};e.prototype.drawLine=function(a){var b=this,d=new GmapPolyFeatureEdit({feature:new google.maps.Polyline,imagePath:this.options.imagePath}),c=b._features.addFeature(d);d.setFeatureID(c);b._features.setCurrentFeature(c);d.setEditState(GMAP_EDIT_STATE_EDIT);
google.maps.event.addListener(d,"click",function(a){b.click(a,this,"Line")});google.maps.event.addListener(d,"dblclick",function(a){b.doubleclick(a,this,"Line")});google.maps.event.addListener(d,"mouseup",function(a){b.mouseup(a,this,"Line")});this.data.addFeature("LineString");for(var f in a)this.appendPoint(a[f])};e.prototype.drawPolygon=function(a){var b=this,d=new GmapPolyFeatureEdit({feature:new google.maps.Polygon,imagePath:this.options.imagePath}),c=b._features.addFeature(d);d.setFeatureID(c);
b._features.setCurrentFeature(c);d.setEditState(GMAP_EDIT_STATE_EDIT);google.maps.event.addListener(d,"click",function(a){b.click(a,this,"Polygon")});google.maps.event.addListener(d,"dblclick",function(a){b.doubleclick(a,this,"Polygon")});google.maps.event.addListener(d,"mouseup",function(a){b.mouseup(a,this,"Polygon")});this.data.addFeature("Polygon");for(var f in a)this.appendPoint(a[f])};e.prototype.appendPoint=function(b){var e=this._features.getCurrentFeature();e!=g&&(e.getPath().push(new google.maps.LatLng(b[1],
b[0])),this.data.addCoordinate(b[1],b[0]),a(this.element).val(this.data.stringify()))};a.fn[k]=function(b){return this.each(function(){a.data(this,"plugin_"+k)||a.data(this,"plugin_"+k,new e(this,b))})}})(jQuery,window,document);function GmapJSON(){this.data=[];this._currentFeature=-1;this.init()}GmapJSON.prototype.init=function(){};GmapJSON.prototype.loadGeoJSON=function(a){var b=[];if(a.type=="GeometryCollection")for(var i in a.geometries)b.push(this._GeoJSON2Internal(a.geometries[i]));else b=Array(this._GeoJSON2Internal(a));this.data=b};
GmapJSON.prototype._internal2GeoJSON=function(a){var b={type:a.type,coordinates:[]};if(a.type=="Point")b.coordinates=a.coordinates;else if(a.type=="LineString")b.coordinates=a.coordinates;else if(a.type=="Polygon")b.coordinates=Array(a.coordinates);return b};
GmapJSON.prototype._GeoJSON2Internal=function(a){var b={type:a.type,coordinates:[]};if(a.type=="Point")b.coordinates=a.coordinates;else if(a.type=="LineString")b.coordinates=a.coordinates;else if(a.type=="Polygon")b.coordinates=a.coordinates[0];return b};GmapJSON.prototype.addFeature=function(a){this._currentFeature++;this.data[this._currentFeature]={type:a,coordinates:[]};return this._currentFeature};
GmapJSON.prototype.removeFeature=function(a){return this.data[a]!=void 0?(this.data.splice(a,1),true):false};GmapJSON.prototype.setCurrentFeature=function(a){return this.data[a]!=void 0?(this._currentFeature=a,true):false};GmapJSON.prototype.addCoordinate=function(a,b,i){if(i==void 0)i=this._currentFeature;this.data[i].type=="Point"?this.data[i].coordinates=[b,a]:this.data[i].coordinates.push([b,a])};GmapJSON.prototype.removeCoordinate=function(){};
GmapJSON.prototype.replaceCoordinate=function(a,b,i,g){if(g==void 0)g=this._currentFeature;this.data[g].type=="Point"?this.data[g].coordinates=[b,a]:this.data[g].coordinates[i]=[b,a]};GmapJSON.prototype.currentFeature=function(){return this.data[this._currentFeature].coordinates};GmapJSON.prototype.stringify=function(){return this.data.length==0?"":JSON.stringify(this.get())};
GmapJSON.prototype.get=function(){if(this.data.length!=0)if(this.data.length==1)return this._internal2GeoJSON(this.data[0]);else{var a=[],b;for(b in this.data)a.push(this._internal2GeoJSON(this.data[b]));return{type:"GeometryCollection",geometries:a}}};var GMAP_EDIT_STATE_EDIT="edit",GMAP_EDIT_STATE_STATIC="static";
function GmapPolyFeatureEdit(a){this.options=jQuery.extend({},{feature:void 0,"static":{strokeColor:"#FF0000",strokeOpacity:0.8,strokeWeight:2,fillColor:"#FF0000",fillOpacity:0.35},edit:{strokeColor:"#00FF00",strokeOpacity:0.8,strokeWeight:2,fillColor:"#00FF00",fillOpacity:0.35},imagePath:"img"},a);if(this.options.feature==void 0)throw"Gmap Feature must be defined";this._feature=this.options.feature;this._state=GMAP_EDIT_STATE_STATIC;this._path=this._feature.getPath();this._points=[];this._featureID=
-1;this.init()}GmapPolyFeatureEdit.prototype.init=function(){var a=this;this._feature.setOptions(this.options[this._state]);google.maps.event.addListener(this._path,"insert_at",function(b){a._pathInsertCallback(b)});google.maps.event.addListener(this._feature,"click",function(b){google.maps.event.trigger(a,"click",b)});google.maps.event.addListener(this._feature,"dblclick",function(){google.maps.event.trigger(a,"dblclick")})};GmapPolyFeatureEdit.prototype.getMap=function(){return this._feature.getMap()};
GmapPolyFeatureEdit.prototype.setMap=function(a){this._feature.setMap(a)};GmapPolyFeatureEdit.prototype.getPath=function(){return this._feature.getPath()};GmapPolyFeatureEdit.prototype.setPath=function(a){this._path=a};GmapPolyFeatureEdit.prototype.getEditState=function(){return this._state};GmapPolyFeatureEdit.prototype.setEditState=function(a){if(a==GMAP_EDIT_STATE_EDIT)this._setStateEdit();else if(a==GMAP_EDIT_STATE_STATIC)this._setStateStatic();else throw"Bad edit state option";};
GmapPolyFeatureEdit.prototype._setStateEdit=function(){for(var a in this._points)this._points[a].setVisible(true);this._feature.setOptions(this.options.edit)};GmapPolyFeatureEdit.prototype._setStateStatic=function(){for(var a in this._points)this._points[a].setVisible(false);this._feature.setOptions(this.options["static"])};GmapPolyFeatureEdit.prototype.setFeatureID=function(a){this._featureID=a};GmapPolyFeatureEdit.prototype.getFeatureID=function(){return this._featureID};
GmapPolyFeatureEdit.prototype._pathInsertCallback=function(a){var b=this,i=new google.maps.MarkerImage(this.options.imagePath+"/point-handle.png",new google.maps.Size(15,15),new google.maps.Point(0,0),new google.maps.Point(8,8)),g=this._feature.getMap(),e=new google.maps.Marker({position:this._path.getAt(a),map:g,icon:i,draggable:true});e.meta={id:this._points.length};this._points.push(e);google.maps.event.addListener(e,"drag",function(){b._feature.getPath().setAt(e.meta.id,e.getPosition())});google.maps.event.addListener(e,
"mouseup",function(a){a.featureID=e.meta.id;google.maps.event.trigger(b,"mouseup",a)})};GMAP_EDIT_STATE_EDIT="edit";GMAP_EDIT_STATE_STATIC="static";function GmapPointFeatureEdit(a){this.options=jQuery.extend({},{feature:void 0,"static":{draggable:false},edit:{draggable:true},imagePath:"img"},a);if(this.options.feature==void 0)throw"Gmap Feature must be defined";this._feature=this.options.feature;this._state=GMAP_EDIT_STATE_STATIC;this._featureID=-1;this.init()}
GmapPointFeatureEdit.prototype.init=function(){var a=this;this._feature.setOptions(this.options[this._state]);google.maps.event.addListener(this._feature,"click",function(b){google.maps.event.trigger(a,"click",b)});google.maps.event.addListener(this._feature,"dblclick",function(){google.maps.event.trigger(a,"dblclick")});google.maps.event.addListener(this._feature,"mouseup",function(b){b.featureID=0;google.maps.event.trigger(a,"mouseup",b)})};GmapPointFeatureEdit.prototype.getMap=function(){return this._feature.getMap()};
GmapPointFeatureEdit.prototype.setMap=function(a){this._feature.setMap(a)};GmapPointFeatureEdit.prototype.getPosition=function(){return this._feature.getPosition()};GmapPointFeatureEdit.prototype.setPosition=function(a){this._feature.setPosition(a)};GmapPointFeatureEdit.prototype.getEditState=function(){return this._state};
GmapPointFeatureEdit.prototype.setEditState=function(a){if(a==GMAP_EDIT_STATE_EDIT)this._setStateEdit();else if(a==GMAP_EDIT_STATE_STATIC)this._setStateStatic();else throw"Bad edit state option";};GmapPointFeatureEdit.prototype._setStateEdit=function(){this._feature.setOptions(this.options[GMAP_EDIT_STATE_EDIT])};GmapPointFeatureEdit.prototype._setStateStatic=function(){this._feature.setOptions(this.options[GMAP_EDIT_STATE_STATIC])};
GmapPointFeatureEdit.prototype.setFeatureID=function(a){this._featureID=a};GmapPointFeatureEdit.prototype.getFeatureID=function(){return this._featureID};function FeatureManager(a){this.options=jQuery.extend({},{map:void 0},a);this.init()}FeatureManager.prototype.init=function(){if(this.options.map==void 0)throw"Map must be defined";this._map=this.options.map;this._features={};this._currentFeatureID=void 0;this._featureIterator=0};FeatureManager.prototype.addFeature=function(a){a.setMap(this._map);this._featureIterator++;this._features[this._featureIterator]=a;return this._featureIterator};
FeatureManager.prototype.removeFeature=function(a){this._features[a].setMap(null);this._features[a]=void 0};FeatureManager.prototype.removeAllFeatures=function(){for(var a in this._features)this._features[a].setMap(null);this._features=[];this._currentFeatureID=void 0};FeatureManager.prototype.setCurrentFeature=function(a){this._currentFeatureID=a};FeatureManager.prototype.getCurrentFeature=function(){if(this._currentFeatureID!=null)return this._features[this._currentFeatureID]};
FeatureManager.prototype.getFeatureAt=function(a){return this._features[a]};FeatureManager.prototype.getFeatures=function(){return this._features};FeatureManager.prototype.getStats=function(){};
