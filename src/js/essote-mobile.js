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
        'toimipisteet': {
          title: 'Toimipisteet',
          'content': '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus aliquet placerat mauris non euismod. Nam vel urna sit amet justo porta tempor. Aenean tristique orci in nibh tempor accumsan. Etiam et nunc ut felis porta fringilla sit amet id purus. Duis ut elit ut nibh lacinia feugiat. Cras ut nunc non eros porta porttitor. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Fusce ullamcorper dictum diam, nec hendrerit quam venenatis vel. Donec non libero rhoncus magna tincidunt imperdiet. Curabitur nec dolor dignissim, tempor erat quis, ullamcorper lorem. Donec ac cursus turpis. In diam ante, aliquam ac dapibus lobortis, pretium at tortor. Suspendisse eleifend, nibh vitae sollicitudin euismod, ante magna aliquet nisi, malesuada pharetra justo lectus quis lacus. </p><p>Vivamus congue tortor ut magna tincidunt imperdiet. Curabitur in porta libero. Pellentesque massa massa, facilisis at ligula in, pellentesque euismod sem. Praesent placerat accumsan est. In eget vehicula ante, eu volutpat nunc. Cras eu nibh in nibh pretium vehicula. Fusce maximus vitae libero et auctor. Vivamus eget dui velit. Maecenas eget metus metus. Aliquam ac scelerisque ligula. Nulla facilisi. Duis malesuada tellus orci. Praesent pharetra enim et finibus ultricies. Vivamus gravida lectus eget eros pharetra congue. Sed suscipit eget tortor vel tempus. </p>'
        },
        'palvelut': {
          title: 'Palvelut',
          content: '<ul><li><a href="http://www.essote.fi/asiakkaalle/palvelut/hammaslaakaripaivystys-ja-hammashoitolat#mikk" >Suun terveydenhuolto</a></li><li><a href="http://www.essote.fi/asiakkaalle/palvelut/neuvolat/" >Neuvolat</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#lastenvalvojat" >Lastenvalvojat</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#oppilashuolto" >Mikkelin perusopetuksen oppilashuollon psykologi- ja kuraattoripalvelut</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#oppilashuolto2aste" >Mikkelin toisen asteen opiskeluhuollon psykologi- ja kuraattoripalvelut</a></li><li><a href="http://www.essote.fi/mikkelin-seudun-opiskelijaterveydenhuolto/">Opiskeluterveydenhuolto</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#kuntoutusosastot" >Kuntousosastot</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#fysio" >Fysioterapia</a></li><li><a href="http://www.essote.fi/asiakkaalle/palvelut/maahanmuuttopalvelut/" >Maahanmuuttopalvelut</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#mielent" >Mielenterveys- ja päihdepalvelut</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#aikuiss" >Aikuissosiaalityön ja taloudellisen tuen palvelut</a></li><li><a href="http://www.essote.fi/asiakkaalle/palvelut/talous-ja-velkaneuvonta/" >Talous- ja velkaneuvonta</a></li><li><a href="http://www.essote.fi/typ-reitti/" >TYP-reitti</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#olkkari" >Ohjaamo Olkkari</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#lastensuoj" >Lastensuojelun ja lapsiperheiden sosiaalipalvelut</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#pessi" >Sijais- ja jälkihuoltoyksikkö Pessi</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#havurinne" >Nuorten vastaanottoyksikkö Havurinne</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#turvakoti" >Turvakoti</a></li><li><a href="http://www.essote.fi/palvelut-paikkakunnittain/mikkelin-hyvinvointiasema#vanhusjavammais" >Vanhus- ja vammaispalvelut</a></li></ul>'
        },
        'ota-yhteytta' : {
          title: 'Ota yhteyttä',
          content: '<p><strong>Etelä-Savon sosiaali- ja terveyspalvelujen kuntayhtymä</strong></p><p>Porrassalmenkatu 35-37 50100 Mikkeli</p><p>Vaihde 015 3511 (ma-pe 8.00-16.00)</p><p><a href="mailto:kirjaamo@essote.fi">kirjaamo@essote.fi</a></p>'
        },
        'tiedotteet-ota-yhteytta': {
          newsImage: 'gfx/news-image-1.jpeg',
          title: 'Taudit liikkeellä',
          date: '22.05.2015 klo 10:49',
          content: '<p>In mollis lectus vitae ipsum aliquam, vel dapibus magna volutpat. Donec luctus tempor odio lacinia luctus. Duis pulvinar orci tristique laoreet cursus. Proin gravida quam eget massa euismod, in consectetur libero ullamcorper. Sed tempor dolor nec gravida cursus. Quisque vehicula leo in erat gravida, id volutpat sapien aliquam. Nullam non bibendum mi, quis vestibulum felis. Mauris cursus velit ac gravida bibendum.</p><p>Nam condimentum non lorem sed posuere. Vivamus ultricies consequat leo luctus pulvinar. In eget odio varius, auctor mi vitae, tincidunt leo. Vestibulum tincidunt varius imperdiet. In in sem lorem. Praesent hendrerit vehicula sapien in pharetra. In nec sagittis dolor. Sed quis metus pharetra, dictum enim ut, porttitor ante. Praesent id dolor ex.</p>'
        },
        'tiedotteet-paivystys': {
          newsImage: 'gfx/news-image-2.jpeg',
          title: 'Rokotuskampanja',
          date: '24.06.2015 klo 07:43',
          content: '<p>In mollis lectus vitae ipsum aliquam, vel dapibus magna volutpat. Donec luctus tempor odio lacinia luctus. Duis pulvinar orci tristique laoreet cursus. Proin gravida quam eget massa euismod, in consectetur libero ullamcorper. Sed tempor dolor nec gravida cursus. Quisque vehicula leo in erat gravida, id volutpat sapien aliquam. Nullam non bibendum mi, quis vestibulum felis. Mauris cursus velit ac gravida bibendum.</p><p>Nam condimentum non lorem sed posuere. Vivamus ultricies consequat leo luctus pulvinar. In eget odio varius, auctor mi vitae, tincidunt leo. Vestibulum tincidunt varius imperdiet. In in sem lorem. Praesent hendrerit vehicula sapien in pharetra. In nec sagittis dolor. Sed quis metus pharetra, dictum enim ut, porttitor ante. Praesent id dolor ex.</p>'
        },
        'tiedotteet-palvelut': {
          newsImage: 'gfx/news-image-3.jpeg',
          title: 'Käsihygieniaviikko',
          date: '18.03.2015 klo 08:32',
          content: '<p>In mollis lectus vitae ipsum aliquam, vel dapibus magna volutpat. Donec luctus tempor odio lacinia luctus. Duis pulvinar orci tristique laoreet cursus. Proin gravida quam eget massa euismod, in consectetur libero ullamcorper. Sed tempor dolor nec gravida cursus. Quisque vehicula leo in erat gravida, id volutpat sapien aliquam. Nullam non bibendum mi, quis vestibulum felis. Mauris cursus velit ac gravida bibendum.</p><p>Nam condimentum non lorem sed posuere. Vivamus ultricies consequat leo luctus pulvinar. In eget odio varius, auctor mi vitae, tincidunt leo. Vestibulum tincidunt varius imperdiet. In in sem lorem. Praesent hendrerit vehicula sapien in pharetra. In nec sagittis dolor. Sed quis metus pharetra, dictum enim ut, porttitor ante. Praesent id dolor ex.</p>'
        },
        'tiedotteet-tiedotteet': {
          newsImage: 'gfx/news-image-4.jpeg',
          title: 'Yleiset',
          date: '20.07.2015 klo 11:24',
          content: '<p>In mollis lectus vitae ipsum aliquam, vel dapibus magna volutpat. Donec luctus tempor odio lacinia luctus. Duis pulvinar orci tristique laoreet cursus. Proin gravida quam eget massa euismod, in consectetur libero ullamcorper. Sed tempor dolor nec gravida cursus. Quisque vehicula leo in erat gravida, id volutpat sapien aliquam. Nullam non bibendum mi, quis vestibulum felis. Mauris cursus velit ac gravida bibendum.</p><p>Nam condimentum non lorem sed posuere. Vivamus ultricies consequat leo luctus pulvinar. In eget odio varius, auctor mi vitae, tincidunt leo. Vestibulum tincidunt varius imperdiet. In in sem lorem. Praesent hendrerit vehicula sapien in pharetra. In nec sagittis dolor. Sed quis metus pharetra, dictum enim ut, porttitor ante. Praesent id dolor ex.</p>'
        },
        'tiedotteet-toimipisteet': {
          title: 'Lorem Ipsum',
          date: '20.07.2015 klo 11:24',
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
      this.subpages['ota-yhteytta'] = new EssoteMobileSubPage(this.options.subpageData['ota-yhteytta'] , pugNewsPage);
      this.subpages['palvelut'] = new EssoteMobileSubPage(this.options.subpageData['palvelut'] , pugNewsPage);
      this.subpages['toimipisteet'] = new EssoteMobileSubPage(this.options.subpageData['toimipisteet'] , pugNewsPage);
      
      this.subpages['tiedotteet-ota-yhteytta'] = new EssoteMobileSubPage(this.options.subpageData['tiedotteet-ota-yhteytta'] , pugNewsPage);
      this.subpages['tiedotteet-paivystys'] = new EssoteMobileSubPage(this.options.subpageData['tiedotteet-paivystys'] , pugNewsPage);
      this.subpages['tiedotteet-palvelut'] = new EssoteMobileSubPage(this.options.subpageData['tiedotteet-palvelut'] , pugNewsPage);
      this.subpages['tiedotteet-tiedotteet'] = new EssoteMobileSubPage(this.options.subpageData['tiedotteet-tiedotteet'] , pugNewsPage);
      this.subpages['tiedotteet-toimipisteet'] = new EssoteMobileSubPage(this.options.subpageData['tiedotteet-toimipisteet'] , pugNewsPage);
      
      
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