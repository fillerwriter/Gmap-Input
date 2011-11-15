(function(a,b,g,e){function c(f,b){this.element=f;this.options=a.extend({},h,b);this.data=new GmapJSON;this._defaults=h;this._name=j;this._map=null;this.init()}var j="gmapInput",h={startPoint:{lat:41.879535,lon:-87.624333,zoom:7},imagePath:"img",featureMaxCount:-1,widgetOptions:{},defaultWidgetOption:GMAP_WIDGET_OPTION_POINT};h.widgetOptions[GMAP_WIDGET_OPTION_POINT]="Draw Point";h.widgetOptions[GMAP_WIDGET_OPTION_LINE]="Draw Line";h.widgetOptions[GMAP_WIDGET_OPTION_POLY]="Draw Polygon";h.widgetOptions[GMAP_WIDGET_OPTION_BOUNDS]=
"Draw Bounds";c.prototype.init=function(){var f=this;this.options.mapState="panning";this.options.currentFeatureType="draw point";this._dblClickTimer=e;this._mapcontainer=a(this.element).after('<div class="gmapInputMap"></div>').siblings(".gmapInputMap").get(0);var b={zoom:this.options.startPoint.zoom,center:new google.maps.LatLng(this.options.startPoint.lat,this.options.startPoint.lon),mapTypeId:google.maps.MapTypeId.ROADMAP,disableDoubleClickZoom:true};this._map=new google.maps.Map(this._mapcontainer,
b);this._features=new FeatureManager({map:this._map});google.maps.event.addListener(this._map,"click",function(a){f._dblClickTimer=setTimeout(function(){f.click(a)},200)});google.maps.event.addListener(this._map,"dblclick",function(a){f.doubleclick(a)});google.maps.event.addListener(this._map,"rightclick",function(a){f.rightclick(a)});if(a(this.element).val()!=""){new google.maps.LatLngBounds;try{var i=jQuery.parseJSON(a(this.element).val());if(i){this.data.loadGeoJSON(i);var d=this.data.get();if(d.type==
"GeometryCollection")for(var c in d.geometries)switch(d.geometries[c].type){case "Point":this.drawPoint(d.geometries[c].coordinates);break;case "LineString":this.drawLine(d.geometries[c].coordinates);break;case "Polygon":this.drawPolygon(d.geometries[c].coordinates[0])}else switch(d.type){case "Point":this.drawPoint(d.coordinates);break;case "LineString":this.drawLine(d.coordinates);break;case "Polygon":this.drawPolygon(d.coordinates[0])}}}catch(g){}b=this._features.getFeatures();for(c in b)b[c].setEditState(GMAP_EDIT_STATE_STATIC);
this._features.setCurrentFeature(null)}this._widget=new GmapDropdownWidget({imagePath:this.options.imagePath,selections:this.options.widgetOptions,defaultSelection:this.options.defaultWidgetOption});c=this._widget.get(0);a(c).click(function(){var a=f._widget.getStatus();f.options.mapState=a.currentState=="active"?"drawing":"panning";switch(a.currentDrawOption){case GMAP_WIDGET_OPTION_POINT:f.options.currentFeatureType="draw point";break;case GMAP_WIDGET_OPTION_LINE:f.options.currentFeatureType="draw line";
break;case GMAP_WIDGET_OPTION_POLY:f.options.currentFeatureType="draw polygon";break;case GMAP_WIDGET_OPTION_BOUNDS:f.options.currentFeatureType="draw bounds"}if(f.options.mapState=="panning"&&(a=f._features.getCurrentFeature()))a.setEditState(GMAP_EDIT_STATE_STATIC),f._features.setCurrentFeature(null)});this._map.controls[google.maps.ControlPosition.TOP_RIGHT].push(c)};c.prototype.version=function(){return"0.1"};c.prototype.getMap=function(){return this._map};c.prototype.click=function(a,b,c){var d=
this._features.getCurrentFeature();if(this.options.mapState=="drawing")switch(this.options.currentFeatureType){case "draw point":this.drawPoint([a.latLng.lng(),a.latLng.lat()]);break;case "draw line":d==e?this.drawLine([[a.latLng.lng(),a.latLng.lat()]]):this.appendPoint([a.latLng.lng(),a.latLng.lat()]);break;case "draw polygon":d==e?this.drawPolygon([[a.latLng.lng(),a.latLng.lat()]]):this.appendPoint([a.latLng.lng(),a.latLng.lat()])}else b!=e?(d=this._features.getCurrentFeature(),d!=e&&d.setEditState(GMAP_EDIT_STATE_STATIC),
this._features.setCurrentFeature(b.getFeatureID()),this.options.currentFeatureType=c,b.setEditState(GMAP_EDIT_STATE_EDIT)):(d=this._features.getCurrentFeature(),d!=e&&d.setEditState(GMAP_EDIT_STATE_STATIC),this._features.setCurrentFeature(null))};c.prototype.doubleclick=function(a){clearTimeout(this._dblClickTimer);var b=this._features.getCurrentFeature();b!=e&&(this.appendPoint([a.latLng.lng(),a.latLng.lat()]),b.setEditState(GMAP_EDIT_STATE_STATIC),this._features.setCurrentFeature(null))};c.prototype.rightclick=
function(){};c.prototype.mouseup=function(b,c){this.data.replaceCoordinate(b.latLng.lng(),b.latLng.lat(),b.featureID,c.getFeatureID()-1);a(this.element).val(this.data.stringify())};c.prototype.drawPoint=function(b){var c=this,i=new GmapPointFeatureEdit({feature:new google.maps.Marker({position:new google.maps.LatLng(b[1],b[0])})}),d=c._features.addFeature(i);i.setFeatureID(d);i.setEditState(GMAP_EDIT_STATE_EDIT);google.maps.event.addListener(i,"click",function(a){c.click(a,this,"Point")});google.maps.event.addListener(i,
"dblclick",function(a){c.doubleclick(a,this,"Point")});google.maps.event.addListener(i,"mouseup",function(a){c.mouseup(a,this,"Point")});this.data.addFeature("Point");this.data.addCoordinate(b[1],b[0]);a(this.element).val(this.data.stringify())};c.prototype.drawLine=function(a){var b=this,c=new GmapPolyFeatureEdit({feature:new google.maps.Polyline,imagePath:this.options.imagePath}),d=b._features.addFeature(c);c.setFeatureID(d);b._features.setCurrentFeature(d);c.setEditState(GMAP_EDIT_STATE_EDIT);
google.maps.event.addListener(c,"click",function(a){b.click(a,this,"Line")});google.maps.event.addListener(c,"dblclick",function(a){b.doubleclick(a,this,"Line")});google.maps.event.addListener(c,"mouseup",function(a){b.mouseup(a,this,"Line")});this.data.addFeature("LineString");for(var e in a)this.appendPoint(a[e])};c.prototype.drawPolygon=function(a){var b=this,c=new GmapPolyFeatureEdit({feature:new google.maps.Polygon,imagePath:this.options.imagePath}),d=b._features.addFeature(c);c.setFeatureID(d);
b._features.setCurrentFeature(d);c.setEditState(GMAP_EDIT_STATE_EDIT);google.maps.event.addListener(c,"click",function(a){b.click(a,this,"Polygon")});google.maps.event.addListener(c,"dblclick",function(a){b.doubleclick(a,this,"Polygon")});google.maps.event.addListener(c,"mouseup",function(a){b.mouseup(a,this,"Polygon")});this.data.addFeature("Polygon");for(var e in a)this.appendPoint(a[e])};c.prototype.appendPoint=function(b){var c=this._features.getCurrentFeature();c!=e&&(c.getPath().push(new google.maps.LatLng(b[1],
b[0])),this.data.addCoordinate(b[1],b[0]),a(this.element).val(this.data.stringify()))};a.fn[j]=function(b){return this.each(function(){a.data(this,"plugin_"+j)||a.data(this,"plugin_"+j,new c(this,b))})}})(jQuery,window,document);function GmapJSON(){this.data=[];this._currentFeature=-1;this.init()}GmapJSON.prototype.init=function(){};GmapJSON.prototype.loadGeoJSON=function(a){var b=[];if(a.type=="GeometryCollection")for(var g in a.geometries)b.push(this._GeoJSON2Internal(a.geometries[g]));else b=Array(this._GeoJSON2Internal(a));this.data=b};
GmapJSON.prototype._internal2GeoJSON=function(a){var b={type:a.type,coordinates:[]};if(a.type=="Point")b.coordinates=a.coordinates;else if(a.type=="LineString")b.coordinates=a.coordinates;else if(a.type=="Polygon")b.coordinates=Array(a.coordinates);return b};
GmapJSON.prototype._GeoJSON2Internal=function(a){var b={type:a.type,coordinates:[]};if(a.type=="Point")b.coordinates=a.coordinates;else if(a.type=="LineString")b.coordinates=a.coordinates;else if(a.type=="Polygon")b.coordinates=a.coordinates[0];return b};GmapJSON.prototype.addFeature=function(a){this._currentFeature++;this.data[this._currentFeature]={type:a,coordinates:[]};return this._currentFeature};
GmapJSON.prototype.removeFeature=function(a){return this.data[a]!=void 0?(this.data.splice(a,1),true):false};GmapJSON.prototype.setCurrentFeature=function(a){return this.data[a]!=void 0?(this._currentFeature=a,true):false};GmapJSON.prototype.addCoordinate=function(a,b,g){if(g==void 0)g=this._currentFeature;this.data[g].type=="Point"?this.data[g].coordinates=[b,a]:this.data[g].coordinates.push([b,a])};GmapJSON.prototype.removeCoordinate=function(){};
GmapJSON.prototype.replaceCoordinate=function(a,b,g,e){if(e==void 0)e=this._currentFeature;this.data[e].type=="Point"?this.data[e].coordinates=[b,a]:this.data[e].coordinates[g]=[b,a]};GmapJSON.prototype.currentFeature=function(){return this.data[this._currentFeature].coordinates};GmapJSON.prototype.stringify=function(){return this.data.length==0?"":JSON.stringify(this.get())};
GmapJSON.prototype.get=function(){if(this.data.length!=0)if(this.data.length==1)return this._internal2GeoJSON(this.data[0]);else{var a=[],b;for(b in this.data)a.push(this._internal2GeoJSON(this.data[b]));return{type:"GeometryCollection",geometries:a}}};var GMAP_EDIT_STATE_EDIT="edit",GMAP_EDIT_STATE_STATIC="static";
function GmapPolyFeatureEdit(a){this.options=jQuery.extend({},{feature:void 0,"static":{strokeColor:"#FF0000",strokeOpacity:0.8,strokeWeight:2,fillColor:"#FF0000",fillOpacity:0.35},edit:{strokeColor:"#00FF00",strokeOpacity:0.8,strokeWeight:2,fillColor:"#00FF00",fillOpacity:0.35},imagePath:"img"},a);if(this.options.feature==void 0)throw"Gmap Feature must be defined";this._feature=this.options.feature;this._state=GMAP_EDIT_STATE_STATIC;this._path=this._feature.getPath();this._points=[];this._featureID=
-1;this.init()}GmapPolyFeatureEdit.prototype.init=function(){var a=this;this._feature.setOptions(this.options[this._state]);google.maps.event.addListener(this._path,"insert_at",function(b){a._pathInsertCallback(b)});google.maps.event.addListener(this._feature,"click",function(b){google.maps.event.trigger(a,"click",b)});google.maps.event.addListener(this._feature,"dblclick",function(){google.maps.event.trigger(a,"dblclick")})};GmapPolyFeatureEdit.prototype.getMap=function(){return this._feature.getMap()};
GmapPolyFeatureEdit.prototype.setMap=function(a){this._feature.setMap(a)};GmapPolyFeatureEdit.prototype.getPath=function(){return this._feature.getPath()};GmapPolyFeatureEdit.prototype.setPath=function(a){this._path=a};GmapPolyFeatureEdit.prototype.getEditState=function(){return this._state};GmapPolyFeatureEdit.prototype.setEditState=function(a){if(a==GMAP_EDIT_STATE_EDIT)this._setStateEdit();else if(a==GMAP_EDIT_STATE_STATIC)this._setStateStatic();else throw"Bad edit state option";};
GmapPolyFeatureEdit.prototype._setStateEdit=function(){for(var a in this._points)this._points[a].setVisible(true);this._feature.setOptions(this.options.edit)};GmapPolyFeatureEdit.prototype._setStateStatic=function(){for(var a in this._points)this._points[a].setVisible(false);this._feature.setOptions(this.options["static"])};GmapPolyFeatureEdit.prototype.setFeatureID=function(a){this._featureID=a};GmapPolyFeatureEdit.prototype.getFeatureID=function(){return this._featureID};
GmapPolyFeatureEdit.prototype._pathInsertCallback=function(a){var b=this,g=new google.maps.MarkerImage(this.options.imagePath+"/point-handle.png",new google.maps.Size(15,15),new google.maps.Point(0,0),new google.maps.Point(8,8)),e=this._feature.getMap(),c=new google.maps.Marker({position:this._path.getAt(a),map:e,icon:g,draggable:true});c.meta={id:this._points.length};this._points.push(c);google.maps.event.addListener(c,"drag",function(){b._feature.getPath().setAt(c.meta.id,c.getPosition())});google.maps.event.addListener(c,
"mouseup",function(a){a.featureID=c.meta.id;google.maps.event.trigger(b,"mouseup",a)})};GMAP_EDIT_STATE_EDIT="edit";GMAP_EDIT_STATE_STATIC="static";function GmapPointFeatureEdit(a){this.options=jQuery.extend({},{feature:void 0,"static":{draggable:false},edit:{draggable:true},imagePath:"img"},a);if(this.options.feature==void 0)throw"Gmap Feature must be defined";this._feature=this.options.feature;this._state=GMAP_EDIT_STATE_STATIC;this._featureID=-1;this.init()}
GmapPointFeatureEdit.prototype.init=function(){var a=this;this._feature.setOptions(this.options[this._state]);google.maps.event.addListener(this._feature,"click",function(b){google.maps.event.trigger(a,"click",b)});google.maps.event.addListener(this._feature,"dblclick",function(){google.maps.event.trigger(a,"dblclick")});google.maps.event.addListener(this._feature,"mouseup",function(b){b.featureID=0;google.maps.event.trigger(a,"mouseup",b)})};GmapPointFeatureEdit.prototype.getMap=function(){return this._feature.getMap()};
GmapPointFeatureEdit.prototype.setMap=function(a){this._feature.setMap(a)};GmapPointFeatureEdit.prototype.getPosition=function(){return this._feature.getPosition()};GmapPointFeatureEdit.prototype.setPosition=function(a){this._feature.setPosition(a)};GmapPointFeatureEdit.prototype.getEditState=function(){return this._state};
GmapPointFeatureEdit.prototype.setEditState=function(a){if(a==GMAP_EDIT_STATE_EDIT)this._setStateEdit();else if(a==GMAP_EDIT_STATE_STATIC)this._setStateStatic();else throw"Bad edit state option";};GmapPointFeatureEdit.prototype._setStateEdit=function(){this._feature.setOptions(this.options[GMAP_EDIT_STATE_EDIT])};GmapPointFeatureEdit.prototype._setStateStatic=function(){this._feature.setOptions(this.options[GMAP_EDIT_STATE_STATIC])};
GmapPointFeatureEdit.prototype.setFeatureID=function(a){this._featureID=a};GmapPointFeatureEdit.prototype.getFeatureID=function(){return this._featureID};function FeatureManager(a){this.options=jQuery.extend({},{map:void 0},a);this.init()}FeatureManager.prototype.init=function(){if(this.options.map==void 0)throw"Map must be defined";this._map=this.options.map;this._features={};this._currentFeatureID=void 0;this._featureIterator=0};FeatureManager.prototype.addFeature=function(a){a.setMap(this._map);this._featureIterator++;this._features[this._featureIterator]=a;return this._featureIterator};
FeatureManager.prototype.removeFeature=function(a){this._features[a].setMap(null);this._features[a]=void 0};FeatureManager.prototype.removeAllFeatures=function(){for(var a in this._features)this._features[a].setMap(null);this._features=[];this._currentFeatureID=void 0};FeatureManager.prototype.setCurrentFeature=function(a){this._currentFeatureID=a};FeatureManager.prototype.getCurrentFeature=function(){if(this._currentFeatureID!=null)return this._features[this._currentFeatureID]};
FeatureManager.prototype.getFeatureAt=function(a){return this._features[a]};FeatureManager.prototype.getFeatures=function(){return this._features};FeatureManager.prototype.getStats=function(){};var GMAP_WIDGET_OPTION_POINT="drawpoint",GMAP_WIDGET_OPTION_LINE="drawline",GMAP_WIDGET_OPTION_POLY="drawpoly",GMAP_WIDGET_OPTION_BOUNDS="drawbounds";function GmapDropdownWidget(a){this.options=jQuery.extend({},{imagePath:"img",selections:{GMAP_WIDGET_OPTION_POINT:"Draw Point",GMAP_WIDGET_OPTION_LINE:"Draw Line",GMAP_WIDGET_OPTION_POLY:"Draw Poly",GMAP_WIDGET_OPTION_BOUNDS:"Draw Bounds"},defaultSelection:GMAP_WIDGET_OPTION_POINT},a);this.init()}
GmapDropdownWidget.prototype.init=function(){this._currentState="inactive";this._currentDrawOption=this.options.defaultSelection;this.iterator=1;this.drawControl=jQuery("<div>").addClass("gmapdropdownwidget");this.render(this.drawControl)};GmapDropdownWidget.prototype.get=function(){return this.drawControl.get(0)};GmapDropdownWidget.prototype.getStatus=function(){return{currentState:this._currentState,currentDrawOption:this._currentDrawOption}};
GmapDropdownWidget.prototype.clickItem=function(a){var b=jQuery,g=b(a).data("drawType");this._currentState=g==this._currentDrawOption?this._currentState=="active"?"inactive":"active":"active";this._currentDrawOption=g;this.render(b(a).parents(".gmapdropdownwidget"))};
GmapDropdownWidget.prototype.render=function(a){var b=jQuery,g=this,e=b("<ul>").addClass("control").css({"background-color":"#FFF","list-style":"none",padding:0,"float":"left","font-family":'"Helvetica", sans-serif',"font-size":"0.8em",margin:0}),c=b("<ul>").addClass("current"),j=b("<ul>").addClass("options");e.append(c).append(j);var h=0,f;for(f in this.options.selections){h++;var k=b("<li>"+this.options.selections[f]+"</li>").data("drawType",f);f==this._currentDrawOption?c.append(k):j.append(k)}a.empty().append(e).css({background:"#FFF",
border:"1px solid #7895d7",cursor:"pointer","box-shadow":"1px 1px 2px #999",margin:"5px 5px 0 0",padding:"0",overflow:"hidden"});this._currentState=="active"&&b(".control .current",a).css({"background-color":"#7895d7",color:"#FFF"});b("ul",a).css({"list-style":"none",margin:0,padding:0});h>1&&(a.append('<div class="dropdown">expand</div>'),b(".dropdown",a).css({background:"url("+this.options.imagePath+"/dropdown.png) center center no-repeat","border-left":"1px solid #000",cursor:"pointer",display:"block",
"float":"left",height:"11px","text-indent":"-9999px",width:"16px",margin:"3px"}),b(".dropdown",a).click(function(){b(".options").slideToggle("fast")}));b("li",a).css({width:"7em",padding:"3px"});b(".options",a).hide();b("li",a).click(function(){g.clickItem(this)})};
