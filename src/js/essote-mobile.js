/* jshint esversion: 6 */
/* global getConfig, pugSubMenu, pugNewsPage, pugEmergencyRoomPage */

(function(){
  'use strict';
  
  class ContentControllerFactory {
    
    static createContentController(type, parent, item) {
      switch (type) {
        case 'ROOT':
          return new RootContentController(parent, item);
        case 'PAGE':
          return new PageContentController(parent, item);
        case 'LINK':
          return new LinkContentController(parent, item);
        case 'NEWS':
          console.log("NewsContentController");
          return new NewsContentController(parent, item);
      }
    }
    
  }
 
  class ContentController {
    
    constructor(parent, item) {
      this.item = item;
      this.id = item ? item.id : null;
      this.parentId = parent ? parent.getId() : null;
    }
    
    getId() {
      return `${this.getType()}-${this.id}`;
    }
    
    getHtml() {
      return '';
    }
    
    getNavigationType() {
      return 'DEFAULT';
    }
    
    getContentHtml() {
      return '';
    }
    
    getParentId() {
      return this.parentId;
    }
    
    getItem() {
      return this.item;  
    }
    
    getTitle() {
      return this.getLocalizedValue(this.item.title, 'FI');
    }
    
    getIcon() {
      return `icon-${this.item.category}`;
    }
    
    getChildren() {
      return new Promise((resolve) => {
        resolve([]);
      });
    }
    
    getContentsApi () {
      return new SoteapiClient.ContentsApi();
    }
    
    getCategoriesApi () {
      return new SoteapiClient.CategoriesApi();
    }
    
    getLocalizedValue (localizedValue, locale) {
      for (let i = 0; i < localizedValue.length; i++) {
        if (localizedValue[i].language === locale) {
          return localizedValue[i].value;
        }
      }
      
      return null;
    }
    
    onScreenResize(activeSlide) {
      
    }
    
    onBeforePageRefresh (activeSlide) {
      
    }
    
    onAfterPageRefresh (activeSlide) {
      
    }
  };
  
  class RootContentController extends ContentController {
    
    getId() {
      return "ROOT";
    }
    
    getType() {
      return 'ROOT';
    }
    
    getHtml() {
      return pugRootView();
    }
    
    getChildListItemHtml(itemController) {
      const item = itemController.getItem();
      
      return pugItemRootListItem({
        item: Object.assign({}, item, {
          id: itemController.getId(),
          icon: itemController.getIcon(),
          name: itemController.getTitle()
        })
      });
    }
    
    getChildren() {
      return this.getContentsApi().listContents({ parentId: 'ROOT', type: ['PAGE', 'LINK']})
        .then((children) => {
          return _.map(children, (child) => {
            return ContentControllerFactory.createContentController(child.type, this, child);
          });
        });
    }
    
  };
  
  class PageContentController extends ContentController {
    
    getType() {
      return 'PAGE';
    }
    
    getHtml() {
      return pugPageView({
        title: this.getTitle()
      });
    }
    
    getChildListItemHtml(itemController) {
      const item = itemController.getItem();
      
      return pugItemPageListItem({
        item: Object.assign({}, item, {
          id: itemController.getId(),
          icon: itemController.getIcon(),
          name: itemController.getTitle(),
          level: this.isNewsRoot() ? item.level + 1 : item.level
        })
      });
    }
    
    getContentHtml() {
      return this.processPageContent(this.getLocalizedValue(this.getItem().content, 'FI'));
    }
    
    isNewsRoot() {
      return !!$('<pre>').html(this.getContentHtml()).find('.sote-api-news-root').length;
    }
    
    getChildren() {
      if (this.isNewsRoot()) {
        return this.getContentsApi().listContents({ type: ['NEWS']})
          .then((children) => {
            return _.map(children, (child) => {
              return ContentControllerFactory.createContentController(child.type, this, child);
            });
        });
      } else {
        return this.getContentsApi().listContents({ parentId: this.id, type: ['PAGE', 'LINK']})
          .then((children) => {
            return _.map(children, (child) => {
              return ContentControllerFactory.createContentController(child.type, this, child);
            });
        });
      }
    }
    
    processPageContent (content) {
      if (!content) {
        return null;
      }
      
      const result = $('<pre>').html(content);
      
      result.find('a').each((index, link) => {
        if ($(link).attr('href').startsWith('tel:')) {
          $(link).addClass('badge badge-pill').wrap($('<div>'));
          if ($(link).hasClass('emergency-phone')) {
            $(link).addClass('badge-danger');
          } else {
            $(link).addClass('badge-primary phone');
          }
        }
      });
      
      return result.html();
    }
    
  };
  
  class LinkContentController extends ContentController {
    
    getType() {
      return 'LINK';
    }
    
    getContentHtml() {
      return $('<pre>').append($('<iframe>')).html(); 
    }
    
    processIframe(iframe) {
      const scaleFrom = parseInt($(iframe).attr('data-content-width'));
      
      if (scaleFrom) {
        const containerWidth = iframe.parent().width();
        const scale = containerWidth / scaleFrom;

        iframe.css({
          'transform-origin': '0 0',
          'transform': `scale(${scale})`,
          'width': containerWidth / scale
        });
      }
    }
    
    onScreenResize(activeSlide) {
      this.processIframe(activeSlide.find('iframe'));
    }
    
    onAfterPageRefresh (activeSlide) {
      let width;
      const iframe = activeSlide.find('iframe');
      const src = this.getLocalizedValue(this.getItem().content, 'FI');
      
      if (src.startsWith('https://islab')) {
        iframe.attr({
          'data-content-width': 800
        });
      }
              
      iframe.on('load', () => {
        this.processIframe(iframe);
      })
      .attr({
        src: src
      });
    }
    
    getHtml() {
      return pugLinkView({});
    }
    
    getNavigationType() {
      return 'EXTERNAL';
    }
    
  };
  
  class NewsContentController extends ContentController {
    
    getType() {
      return 'NEWS';
    }
    
    getHtml() {
      return pugNewsView({
        title: this.getTitle()
      });
    }
    
    getContentHtml() {
      const date = null;
      const newsImage = null;
      
      return pugNewsContent({
        date: date,
        newsImage: newImage,
        title: this.getTitle(),
        content: this.getLocalizedValue(this.getItem().content, 'FI')
      });
    }
    
  };
  
  $.widget("custom.essoteMobile", {
    
    options: {
      maxLevel: 5,
      queueTimeout: 200
    },

    _create : function() {
      SoteapiClient.ApiClient.instance.basePath = 'https://essote-soteapi.metatavu.io/v1';
      
      this._rootController = new RootContentController();
      this._controllerStack = [this._rootController];
      this._itemStore = {};
      this._treeStore = {};
      
      this.element.find('.swiper-wrapper').append(this._getActiveController().getHtml());
      
      this._swiper = new Swiper('.swiper-container', { });
      this._swiper.on('slidePrevTransitionEnd', this._onSlidePrevTransitionEnd.bind(this));
      this._swiper.on('slideNextTransitionEnd', this._onSlideNextTransitionEnd.bind(this));
 
      this.element.on('touchend', '.back-btn', $.proxy(this._onBackBtnTouchEnd, this));
      this.element.on('touchstart', '.list-link', $.proxy(this._onListItemTouchStart, this));
      this.element.on('touchend', '.list-link', $.proxy(this._onListItemTouchEnd, this));
      this.element.on('itemChange', $.proxy(this._onItemChange, this));
      
      this._swiper.slideNext();
      this._refreshPage();
      
      this._taskQueue = async.priorityQueue(this._onTaskQueueCallback.bind(this), 1);
      this._taskQueue.drain = this._onTaskQueueDrain.bind(this);
      this._taskQueue.push({type: 'item', 'itemController': this._rootController}, 0);
      
      $(window).resize(this._onWindowResize.bind(this));
    },
    
    _onWindowResize: function () {
      this._getActiveController().onScreenResize($('.swiper-slide-active .content-page-content'));
    },
    
    _getActiveController: function () {
      return this._controllerStack[this._controllerStack.length - 1];
    },
    
    _onSlidePrevTransitionEnd: function () {
      this._controllerStack.pop();
      this._refreshPage();
    },
    
    _onSlideNextTransitionEnd: function () {
      this._refreshPage();
    },
    
    _onTaskQueueCallback: function (task, callback) {
      switch (task.type) {
        case 'item':
          if (task.itemController.getItem()) {
            this._persistItem(task.itemController);
          }
          
          task.itemController.getChildren().then((children) => {
            children.forEach((child) => {
              this._taskQueue.push({type: 'item', 'itemController': child}, 0);
            });
            
            setTimeout(() => {
              callback();
            }, this.options.queueTimeout);
          });
        break;
      }
    },
    
    _onTaskQueueDrain: function () {
      this._taskQueue.push({type: 'item', 'itemController': this._rootController}, 0);
    },
    
    _persistItem: function (itemController) {
      const id = itemController.getId();
      const parentId = itemController.getParentId();
      const newItem = itemController.getItem();
      const oldItem = this._getStoredItem(id);
      
      if (!_.isEqual(oldItem, newItem)) {
        this._itemStore[id] = newItem;
        this.element.trigger('itemChange', {
          itemController: itemController
        });
      }
      
      if (!this._treeStore[parentId]) {
        this._treeStore[parentId] = [];
      }
      
      if (this._treeStore[parentId].indexOf(id) === -1) {
        this._treeStore[parentId].push(id);
      }
    },
    
    _getItemController: function (parentController, id) {
      const item = this._getStoredItem(id);
      if (item) {
        return ContentControllerFactory.createContentController(item.type, parentController, item);
      } else {
        console.error(`Could not find item by id ${id}`);
        return null;
      }
    },
    
    _getStoredItem: function (id) {
      return this._itemStore[id];
    },
    
    _listByParent: function (parentController) {
      const childIds = this._treeStore[parentController.getId()]||[];
      return childIds.map((childId) => {
        const child = this._getStoredItem(childId);
        return ContentControllerFactory.createContentController(child.type, parentController, child);
      });
    },
    
    _refreshChildPages: function () {
      const childPages = this._listByParent(this._getActiveController());
      $('.swiper-slide-active .child-items-container').empty();
      
      childPages.forEach((childPage) => {
        const itemHtml = this._getActiveController().getChildListItemHtml(childPage);
        $('.swiper-slide-active .child-items-container').append(itemHtml);
      });
    },
    
    _refreshPage: function () {
      this._refreshChildPages();
      this._getActiveController().onBeforePageRefresh($('.swiper-slide-active .content-page-content'));
      $('.swiper-slide-active .content-page-content').html(this._getActiveController().getContentHtml());
      this._getActiveController().onAfterPageRefresh($('.swiper-slide-active .content-page-content'));
    },
    
    _onItemChange: function (event, data) {
      const itemController = data.itemController;
      const id = itemController.getId();
      const parentId = itemController.getParentId();
        
      if (parentId === this._getActiveController().getId() || id === this._getActiveController().getId()) {
        this._refreshPage();
      }
    },
    
    _onListItemTouchStart: function(e) {
      const item = $(e.target).closest('.list-link');      
      $('.list-link').removeClass('active');
      item.addClass('active');
      
      const listItemId = item.attr('data-id');
      const listItemLevel = parseInt(item.attr('data-level'), 10);
      
      this._controllerStack.push(this._getItemController(this._getActiveController(), listItemId));
      
      const slidesToRemove = [ ];
      for (let i = listItemLevel + 1; i <= this.options.maxLevel; i++) {
        slidesToRemove.push(i);
      }

      this._swiper.removeSlide(slidesToRemove);
      this._swiper.appendSlide(this._getActiveController().getHtml());
    },
    
    _onListItemTouchEnd: function(e) {
      this._swiper.slideNext();
      $('.list-link').removeClass('active');
    },
    
    _onBackBtnTouchEnd: function(e) {
      this._swiper.slidePrev();
    }
    
  });
  
  $(document).on("deviceready", () => {
    console.log('Starting');
    $(document.body).essoteMobile();
  });

})();