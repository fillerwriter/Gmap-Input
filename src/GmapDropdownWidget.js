var GMAP_WIDGET_OPTION_POINT = 'drawpoint';
var GMAP_WIDGET_OPTION_LINE = 'drawline';
var GMAP_WIDGET_OPTION_POLY = 'drawpoly';
var GMAP_WIDGET_OPTION_BOUNDS = 'drawbounds';

function GmapDropdownWidget(options) {
  var defaults = {
    imagePath: 'img',
    selections: {},
    defaultSelection: GMAP_WIDGET_OPTION_POINT
  };

  defaults.selections[GMAP_WIDGET_OPTION_POINT] = 'Draw Point';
  defaults.selections[GMAP_WIDGET_OPTION_LINE] = 'Draw Line';
  defaults.selections[GMAP_WIDGET_OPTION_POLY] = 'Draw Polygon';
  defaults.selections[GMAP_WIDGET_OPTION_BOUNDS] = 'Draw Bounds';

  this.options = jQuery.extend({}, defaults, options);
  this.init();
}

GmapDropdownWidget.prototype.init = function() {
  var $this = this;

  this._currentState = 'inactive';
  this._currentDrawOption = this.options.defaultSelection;
  this.iterator = 1;

  this.drawControl = jQuery('<div>').addClass('gmapdropdownwidget');
  this.render(this.drawControl);
}

GmapDropdownWidget.prototype.get = function() {
  return this.drawControl.get(0);
}

GmapDropdownWidget.prototype.getStatus = function() {
  return {
    currentState: this._currentState,
    currentDrawOption: this._currentDrawOption
  };
}

GmapDropdownWidget.prototype.clickItem = function(item) {
  var $ = jQuery;
  var $this = this;
  
  var dataType = $(item).data('drawType');
  
  if (dataType == this._currentDrawOption) {
    if (this._currentState == 'active') {
      this._currentState = 'inactive';
    } else {
      this._currentState = 'active';
    }
  } else {
    this._currentState = 'active';
  }

  this._currentDrawOption = dataType;

  this.render($(item).parents('.gmapdropdownwidget'));
}

GmapDropdownWidget.prototype.render = function(widget) {
  var $ = jQuery;
  var $this = this;
  
  var list = $('<ul>').addClass('control').css({
    'background-color': '#FFF',
    'list-style': 'none',
    'padding': 0,
    'float': 'left',
    'font-family': '"Helvetica", sans-serif',
    'font-size': '0.8em',
    'margin': 0
  });

  var current = $('<ul>').addClass('current');
  var options = $('<ul>').addClass('options');
  list.append(current).append(options);

  var optionCount = 0;

  for (var i in this.options.selections) {
    optionCount++;
    var datum = $('<li>' + this.options.selections[i] + '</li>').data('drawType', i);
    if (i == this._currentDrawOption) {
      current.append(datum)
    } else {
      options.append(datum);
    }
  }
  
  widget.empty().append(list).css({
    'background': '#FFF',
    'border': '1px solid #7895d7',
    'cursor': 'pointer',
    'box-shadow': '1px 1px 2px #999',
    'margin': '5px 5px 0 0',
    'padding': '0',
    'overflow': 'hidden'
  });

  if (this._currentState == 'active') {
    $('.control .current', widget).css({
      'background-color': '#7895d7',
      'color': '#FFF'
    });
  }

    $('ul', widget).css({
      'list-style': 'none',
      'margin': 0,
      'padding': 0
    });

  if (optionCount > 1) {
    widget.append('<div class="dropdown">expand</div>');

    $('.dropdown', widget).css({
      'background': 'url(' + this.options.imagePath + '/dropdown.png) center center no-repeat',
      'border-left': '1px solid #000',
      'cursor': 'pointer',
      'display': 'block',
      'float': 'left',
      'height': '11px',
      'text-indent': '-9999px',
      'width': '16px',
      'margin': '3px'
    });
    
    $('.dropdown', widget).click(function () {
      $('.options').slideToggle('fast');
    });
  }

  $('li', widget).css({
    'width': '7em',
    'padding': '3px'
  });

  $('.options', widget).hide();
  
  $('li', widget).click(function() {
    $this.clickItem(this);
  });
}
