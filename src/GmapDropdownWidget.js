var GMAP_WIDGET_OPTION_POINT = 'drawpoint';
var GMAP_WIDGET_OPTION_LINE = 'drawline';
var GMAP_WIDGET_OPTION_POLY = 'drawpoly';
var GMAP_WIDGET_OPTION_BOUNDS = 'drawbounds';

function GmapDropdownWidget(options) {
  var defaults = {
    selections: {}
  };

  defaults.selections[GMAP_WIDGET_OPTION_POINT] = 'Draw Point';
  defaults.selections[GMAP_WIDGET_OPTION_LINE] = 'Draw Line';
  defaults.selections[GMAP_WIDGET_OPTION_POLY] = 'Draw Polygon';
  defaults.selections[GMAP_WIDGET_OPTION_BOUNDS] = 'Draw Bounds';

  this.options = jQuery.extend( {}, defaults, options) ;
  this.init();
}

GmapDropdownWidget.prototype.init = function() {
  var $ = jQuery;
  this.drawControl = $('<div>');
  var list = $('<ul>').addClass('control').css({
      'background-color': '#FFF',
      'list-style': 'none',
      'padding-left': 0,
      'float': 'left',
      'font-family': '"Helvetica", sans-serif',
      'font-size': '0.8em',
      'margin': 0
    });

  for (var i in this.options.selections) {
    list.append('<li>' + this.options.selections[i] + '</li>');
  }

  this.drawControl.append(list.get(0)).append('<div class="dropdown">expand</div>').css({
      'background': '#FFF',
      'border': '1px solid #7895d7',
      'cursor': 'pointer',
      'box-shadow': '1px 1px 2px #999',
      'margin': '5px 5px 0 0',
      'padding': '3px',
      'overflow': 'hidden'
    });
  $('.dropdown', this.drawControl).css({
      'background': 'url(' + this.options.imagePath + '/dropdown.png) center center no-repeat',
      'border-left': '1px solid #000',
      'cursor': 'pointer',
      'display': 'block',
      'float': 'left',
      'height': '11px',
      'text-indent': '-9999px',
      'width': '16px'
    });
}

GmapDropdownWidget.prototype.get = function() {
  return this.drawControl.get(0);
}

/*
    var drawControlContainer = document.createElement('DIV');
    var list = $('<ul>').addClass('control').css({
      'background-color': '#FFF',
      'list-style': 'none',
      'padding-left': 0,
      'float': 'left',
      'font-family': '"Helvetica", sans-serif',
      'font-size': '0.8em',
      'margin': 0
    })
      .html('<ul class="current"><li>Draw Point</li></ul><ul class="options"><li>Draw Line</li><li>Draw Polygon</li><li>Draw Bounds</li></ul>');

    var drawControl = $('<div>').append(list).append('<div class="dropdown">expand</div>').css({
      'background': '#FFF',
      'border': '1px solid #7895d7',
      'cursor': 'pointer',
      'box-shadow': '1px 1px 2px #999',
      'margin': '5px 5px 0 0',
      'padding': '3px',
      'overflow': 'hidden'
    });
    $('.dropdown', drawControl).css({
      'background': 'url(' + this.options.imagePath + '/dropdown.png) center center no-repeat',
      'border-left': '1px solid #000',
      'cursor': 'pointer',
      'display': 'block',
      'float': 'left',
      'height': '11px',
      'text-indent': '-9999px',
      'width': '16px'
    });

    $('ul', drawControl).css({
      'list-style': 'none',
      'margin': 0,
      'padding': 0
    });

    $('li', drawControl).css({
      'width': '7em'
    });

    $('.options', drawControl).hide();

    drawControlContainer = drawControl.get(0);
    this._map.controls[google.maps.ControlPosition.TOP_RIGHT].push(drawControlContainer);

    $('li', drawControlContainer).click(function () {
      var draw_options = new Object();
      draw_options[DRAW_POINT] = 'Draw Point';
      draw_options[DRAW_LINE] = 'Draw Line';
      draw_options[DRAW_POLY] = 'Draw Polygon';
      draw_options[DRAW_BOUNDS] = 'Draw Bounds';

      $(this).parent().parent().find('li').css({
        'background-color': '#FFF',
        'color': '#000'
      });

      if ($(this).text() == draw_options[$this.options.currentFeatureType]) {
        if ($this.options.mapState == MAP_STATE_DRAWING) {
          $this.options.mapState = MAP_STATE_PANNING;
        } else {
          $this.options.mapState = MAP_STATE_DRAWING;
          $(this).css({
            'background-color': '#7895d7',
            'color': '#FFF'
          });
        }
      } else {
        $this.options.mapState = MAP_STATE_DRAWING;
        $(this).css({
          'background-color': '#7895d7',
          'color': '#FFF'
        });
      }

      switch ($(this).text()) {
        case 'Draw Point':
          $this.options.currentFeatureType = DRAW_POINT;
        break;
        case 'Draw Line':
          $this.options.currentFeatureType = DRAW_LINE;
        break;
        case 'Draw Polygon':
          $this.options.currentFeatureType = DRAW_POLY;
        break;
        case 'Draw Bounds':
          $this.options.currentFeatureType = DRAW_BOUNDS;
        break;
      }

      var currentFeature = $this._features.getCurrentFeature();
      if (currentFeature != undefined) {
        currentFeature.setEditState(GMAP_EDIT_STATE_STATIC);
        $this._features.setCurrentFeature(null);
      }
    });

    $('.dropdown', drawControlContainer).click(function () {
      $('.options').slideToggle('fast');
    });*/