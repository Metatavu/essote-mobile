/* jshint esversion: 6 */
/* global getConfig, pugSubMenu, pugNewsPage, pugEmergencyRoomPage */

(function(){
  'use strict';
  
  $.widget("custom.essoteMobile", {
    
    options: {
      maxLevel: 2,
      indexMenuItems: [
        {target: 'ota-yhteytta', icon: 'icon-ota-yhtaytta', name: 'Ota yhteyttä', level: 1},
        {target: 'paivystys', icon: 'icon-paivystys', name: 'Päivystys', level: 1},
        {target: 'palvelut', icon: 'icon-palvelut', name: 'Palvelut', level: 1},
        {target: 'tiedotteet', icon: 'icon-tiedotteet', name: 'Tiedotteet', level: 1},
        {target: 'toimipisteet', icon: 'icon-toimipisteet', name: 'Toimipisteet', level: 1}
      ],
      
      subpageData: {
        tiedotteet: [
          {target: 'tiedotteet-ota-yhteytta', icon: 'icon-ota-yhtaytta', name: 'Taudit liikkeellä', level: 2},
          {target: 'tiedotteet-paivystys', icon: 'icon-paivystys', name: 'Rokotuskampanja', level: 2},
          {target: 'tiedotteet-palvelut', icon: 'icon-palvelut', name: 'Käsihygieniaviikko', level: 2},
          {target: 'tiedotteet-tiedotteet', icon: 'icon-tiedotteet', name: 'Yleiset', level: 2},
          {target: 'tiedotteet-toimipisteet', icon: 'icon-toimipisteet', name: 'Lorem Ipsum', level: 2}
        ],
        'tiedotteet-ota-yhteytta': {
          newsImage: 'gfx/news-image-1.jpeg',
          title: 'Lorem Ipsum',
          date: '22.05.2015 klo 10:49',
          content: '<p>In mollis lectus vitae ipsum aliquam, vel dapibus magna volutpat. Donec luctus tempor odio lacinia luctus. Duis pulvinar orci tristique laoreet cursus. Proin gravida quam eget massa euismod, in consectetur libero ullamcorper. Sed tempor dolor nec gravida cursus. Quisque vehicula leo in erat gravida, id volutpat sapien aliquam. Nullam non bibendum mi, quis vestibulum felis. Mauris cursus velit ac gravida bibendum.</p><p>Nam condimentum non lorem sed posuere. Vivamus ultricies consequat leo luctus pulvinar. In eget odio varius, auctor mi vitae, tincidunt leo. Vestibulum tincidunt varius imperdiet. In in sem lorem. Praesent hendrerit vehicula sapien in pharetra. In nec sagittis dolor. Sed quis metus pharetra, dictum enim ut, porttitor ante. Praesent id dolor ex.</p>'
        }
      }
    },

    _create : function() {
      this.createIndexPage();
      this._swiper = new Swiper('.swiper-container', { });
      this.subpages = {};
      this.subpages['tiedotteet'] = new EssoteMobileSubPage({title: 'Tiedotteet', links: this.options.subpageData['tiedotteet'] }, pugSubMenu);
      this.subpages['paivystys'] = new EssoteMobileSubPage({title: 'PÄIVYSTYS'}, pugEmergencyRoomPage);
      this.subpages['tiedotteet-ota-yhteytta'] = new EssoteMobileSubPage(this.options.subpageData['tiedotteet-ota-yhteytta'] , pugNewsPage);
      
      $(this.element).on('touchend', '.back-btn', $.proxy(this._onBackBtnTouchEnd, this));
      
      $(this.element).on('touchstart', '.list-link', $.proxy(this._onListItemTouchStart, this));
      $(this.element).on('touchend', '.list-link', $.proxy(this._onListItemTouchEnd, this));
    },
    
    _onListItemTouchStart: function(e) {
      $('.list-link').removeClass('active');
      const listItemTarget = $(e.target).closest('.list-link').addClass('active').attr('data-target');
      const listItemLevel = parseInt($(e.target).closest('.list-link').attr('data-level'), 10);
      console.log(listItemLevel);
      this.createSubPage(listItemTarget, listItemLevel);
    },
    
    _onListItemTouchEnd: function(e) {
      $('.list-link').removeClass('active');
      this._swiper.slideNext();
    },
    
    _onBackBtnTouchEnd: function(e) {
      this._swiper.slidePrev();
    },
    
    createIndexPage: function() {
      const indexHtml = pugIndexMenu({
        links: this.options.indexMenuItems
      });
      
      $(this.element).find('.swiper-wrapper').append(indexHtml);
    },
    
    createSubPage: function(pageSlug, level) {
      const subPageHtml = this.subpages[pageSlug].render();
      const slidesToRemove = [ ];
      for(let i = level; i <= this.options.maxLevel; i++) {
        slidesToRemove.push(i);
      }
      console.log(slidesToRemove);
      this._swiper.removeSlide(slidesToRemove);
      this._swiper.appendSlide(subPageHtml);
    }
    
  });
  
  $(document).on("deviceready", () => {
    console.log('Starting');
    $(document.body).essoteMobile();
  });

})();