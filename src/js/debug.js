(function() {
  'use strict';
  
  var messages = [];
  
  console.log = function () {
    messages.push(arguments);
  };
  
  $(document).ready(function () {
    $('<div>')
      .attr('id', 'log')
      .css({
        'color': '#0a0',
        'background': 'rgba(0, 0, 0, 0.9)',
        'position': 'fixed',
        'left': '0px',
        'right': '0px',
        'bottom': '0px',
        'font': 'Courier New',
        'word-break': 'break-all',
        'z-index': '9999'
      })
      .appendTo(document.body);
    
    console.log = function () {
      $('#log').append($('<div>').text(JSON.stringify(arguments)));
    };
    
    window.onerror = function (msg, url, line) {
        console.log("Caught via window.onerror: '" + msg + "' from " + url + ":" + line);
    };

    for (var i = 0, l = messages.length; i < l; i++) {
      console.log(messages[i]);
    }
    
    $(document).on('click', '#log', function (event) {
      $('#log').empty();
    });
    
  });

}).call(this);