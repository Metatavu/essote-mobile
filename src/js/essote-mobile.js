/* jshint esversion: 6 */
/* global getConfig */

(function(){
  'use strict';
  
  $.widget("custom.essoteMobile", {
    
    options: {
      indexMenuItems: [
        {target: 'ota-yhteytta', icon: 'icon-ota-yhtaytta', name: 'Ota yhteyttä'},
        {target: 'paivystys', icon: 'icon-paivystys', name: 'Päivystys'},
        {target: 'palvelut', icon: 'icon-palvelut', name: 'Palvelut'},
        {target: 'tiedotteet', icon: 'icon-tiedotteet', name: 'Tiedotteet'},
        {target: 'toimipisteet', icon: 'icon-toimipisteet', name: 'Toimipisteet'}
      ]
    },

    _create : function() {
      this.renderIndexPage();
    },
    
    renderIndexPage: function() {
      const indexHtml = pugIndexMenu({
        links: this.options.indexMenuItems
      });
      
      $(this.element).find('.page-content-container').append(indexHtml);
    }
    
  });
  
  $(document).on("deviceready", () => {
    $(document.body).essoteMobile();
  });

})();