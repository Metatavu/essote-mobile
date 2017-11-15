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
          return new NewsContentController(parent, item);
        case 'EVENT':
          return new EventContentController(parent, item);
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
    
    getEventsApi () {
      return new SoteapiClient.EventsApi();
    }
    
    parseTimeFilter(value) {
      if (!value) {
        return;
      }
      
      switch (value) {
        case 'WEEK_START':
          return moment().startOf('isoWeek').format();
        case 'WEEK_END':
          return moment().endOf('isoWeek').format();
        case 'DAY_START':
          return moment().startOf('day').format();
        case 'DAY_END':
          return moment().endOf('day').format();
        case 'TOMORROW_MORNING':
          return moment().add(1, 'days').hour(8).minute(0).format();
      }
      
      return moment(value).format();
    }
    
    getLocalizedValue (localizedValue, locale) {
      if (localizedValue) {
        for (let i = 0; i < localizedValue.length; i++) {
          if (localizedValue[i].language === locale) {
            return localizedValue[i].value;
          }
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
      const navigationType = itemController.getNavigationType();
      
      switch (navigationType) {
        case 'EXTERNAL':
          return pugItemPageListItemExternal({
            item: Object.assign({}, item, {
              id: itemController.getId(),
              icon: itemController.getIcon(),
              name: itemController.getTitle(),
              level: this.isVirtualLevel() ? item.level + 1 : item.level,
              link: this.getLocalizedValue(item.content, 'FI')
            })
          });
        default:
          return pugItemPageListItem({
            item: Object.assign({}, item, {
              id: itemController.getId(),
              icon: itemController.getIcon(),
              name: itemController.getTitle(),
              level: this.isVirtualLevel() ? item.level + 1 : item.level
            })
          });
      }
    }
    
    getContentHtml() {
      return this.processPageContent(this.getLocalizedValue(this.getItem().content, 'FI'));
    }
    
    isVirtualLevel() {
      return !!this.getCustomChildrenList().length;
    }
    
    getCustomChildrenTypeList(type, options) {
      switch (type) {
        case 'EVENT':
          return this.getEventsApi().listEvents(options['event']).then((events) => {
            return events.map((event) => {
              return Object.assign({}, event, {
                order: event.startDate.getTime(),
                item: Object.assign({}, event, {
                  type: 'EVENT',
                  level: 0
                })
              });
            });
          });
        break;
        case 'NEWS':
          return this.getContentsApi().listContents({ type: ['NEWS'] }).then((newsArticles) => {
            return newsArticles.map((newsArticle) => {
              return Object.assign({}, newsArticle, {
                order: newsArticle.created.getTime(),
                item: newsArticle
              });
            });
          });
        break;
      }
    }
    
    getCustomChildren(types, options) {
      const childPromises = types.map((type) => { 
        return this.getCustomChildrenTypeList(type, options); 
      });
      
      return Promise.all(childPromises)
        .then((resultDatas) => {
          const results = _.flatten(resultDatas);
          results.sort((a, b) => {
            return b.order - a.order;
          });
          
          return _.map(results, (result) => {
            return ContentControllerFactory.createContentController(result.item.type, this, result.item);
          });
        });
    }
    
    getCustomChildrenList() {
      return $('<pre>').html(this.getContentHtml()).find('.sote-api-child-list');
    }
    
    getCustomChildrenOptions(customChildrenList) {
      return {
        sort: customChildrenList.attr('data-sort'),
        event: {
          category: customChildrenList.attr('data-event-category'),
          endsAfter: this.parseTimeFilter($(customChildrenList).attr('data-event-ends-after')),
          startsBefore: this.parseTimeFilter($(customChildrenList).attr('data-event-starts-before'))  
        }
      };
    }
    
    getChildren() {
      const customChildrenList = this.getCustomChildrenList();
      if (customChildrenList.length) {
        return this.getCustomChildren(customChildrenList.attr('data-types').split(','), this.getCustomChildrenOptions(customChildrenList));
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
      
      result.find('.sote-api-child-list').empty();
      
      return result.html();
    }
    
    loadEventList(list) {
      const options = {
        category: $(list).attr('data-category'),
        endsAfter: this.parseTimeFilter($(list).attr('data-ends-after')),
        startsBefore: this.parseTimeFilter($(list).attr('data-starts-before'))
      };
      
      this.getEventsApi().listEvents(options).then((events) => {
        $(list).html(pugEventListMinimal({
          events: events.map((event) => {
            return Object.assign({}, event, {
              title: this.getLocalizedValue(event.title, 'FI')
            });
          }),
          moment: moment
        }))
        .removeClass('loading');
      })
      .catch((err) => {
        console.error(`Failed to load event list: ${err}`);
      });
    }
    
    onAfterPageRefresh (activeSlide) {
      $(activeSlide).find('.sote-api-event-list').each((index, list) => {
        this.loadEventList($(list).addClass('loading').empty());
      });
    }
    
  }
  
  class LinkContentController extends ContentController {
    
    getType() {
      return 'LINK';
    }
    
    getHtml() {
      return pugLinkView({
        title: this.getTitle()
      });
    }
    
    getContentHtml() {
      return $('<pre>').append($('<iframe>')).html(); 
    }
    
    processIframe(iframe) {
      const scaleFrom = parseInt($(iframe).attr('data-content-width'));
      
      if (scaleFrom) {
        const containerWidth = iframe.parent().width();
        const containerHeight = $(window).height() - 77;
        const scale = containerWidth / scaleFrom;
        
        iframe.css({
          'transform-origin': '0 0',
          'transform': `scale(${scale})`,
          'width': containerWidth / scale,
          'height': containerHeight / scale 
        });
      }
    }
    
    onScreenResize(activeSlide) {
      this.processIframe(activeSlide.find('iframe'));
    }
    
    onBeforePageRefresh (activeSlide) {
      activeSlide.addClass('loading');
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
        activeSlide.removeClass('loading');
        this.processIframe(iframe);
      })
      .attr({
        src: src
      });
    }
    
    getNavigationType() {
      const src = this.getLocalizedValue(this.getItem().content, 'FI');
      if (src.startsWith('https://www.google.fi/maps/')) {
        // Google Maps links are opened with Gmaps app
        return 'EXTERNAL';
      }
      
      if (src.startsWith('https')) {
        // Https links can be opened as iframes
        return 'IFRAME';
      }
      
      // Others are displayed as links
      
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
      const date = this.getItem().created;
      const newsImage = null;
      
      return pugNewsContent({
        moment: moment,
        date: date,
        newsImage: newsImage,
        title: this.getTitle(),
        content: this.getLocalizedValue(this.getItem().content, 'FI')
      });
    }
    
  };
  
  class EventContentController extends ContentController {
    
    getType() {
      return 'EVENT';
    }
    
    getHtml() {
      return pugNewsView({
        title: this.getTitle()
      });
    }
    
    getContentHtml() {
      const date = this.getItem().startDate;
      const newsImage = null;
      
      return pugNewsContent({
        moment: moment,
        date: date,
        newsImage: newsImage,
        title: this.getTitle(),
        content: this.getLocalizedValue(this.getItem().description, 'FI')
      });
    }
    
  };
  
  class Database {
    
    constructor(options) {
      this.options = options;
      this.database = null;
    }
    
    initialize() {
      return this.openDatabase();
    }
    
    useWebSQL() {
      return device.platform === 'browser';
    }
    
    openDatabase() {
      return new Promise((resolve, reject) => {
        if (this.useWebSQL()) {
          this.database = window.openDatabase(this.options.database, '1.0', this.options.database, 2 * 1024 * 1024);
          resolve(this.executeBatch(this.options.prepareStatements||[]));
        } else {
          const database = window.sqlitePlugin.openDatabase({ name: this.options.database, location: this.options.location }, (database) => {
            this.database = database;
            resolve(this.executeBatch(this.options.prepareStatements||[]));
          });
        }
      });
    }
    
    executeBatch(statements) {
      if (this.useWebSQL()) {
        return Promise.all(statements.map((statement) => {
          return this.executeSql(statement);
        }));
      } else {
        return new Promise((resolve, reject) => {
          this.database.sqlBatch(statements, resolve, reject);
        });
      }
    }
    
    executeSql(sql, params) {
      return new Promise((resolve, reject) => {
        if (this.useWebSQL()) {
          this.database.transaction((transaction) => {
            transaction.executeSql(sql, params, (p1, p2) => {
              resolve(this.useWebSQL() ? p2 : p1);
            }, (p1, p2) => {
              reject(this.useWebSQL() ? p2 : p1);
            });
          });
        } else {
          return this.database.executeSql(sql, params, resolve, reject);
        }
      });
    }
    
    list(sql, params) {
      return new Promise((resolve, reject) => {
        this.executeSql(sql, params)
          .then((resultSet) => {
            const result = [];
    
            for (let i = 0; i < resultSet.rows.length; i++) {
              result.push(resultSet.rows.item(i));
            }
            
            resolve(result);
          })
          .catch((err) => {
            console.error(`Failed to execute sql ${sql}`, err);
            resolve([]);
          });
      });
    }
    
    find(sql, params) {
      return this.list(sql, params)
        .then((result) => {
          return result && result.length ? result[0] : null;
        });
    }
    
  }
  
  class ItemDatabase extends Database {
    
    constructor(startClean) {
      const prepareStatements = startClean ? ['DROP TABLE IF EXISTS Item'] : [];
      prepareStatements.push('CREATE TABLE IF NOT EXISTS Item (id varchar(255) primary key, parentId varchar(255), data longtext, orderIndex bigint(20))');
      
      super({
        database: 'essote-mobile.db',
        location: 'default',
        prepareStatements: prepareStatements
      });
    }
    
    findItemById(id) {
      return this.find('SELECT id, data FROM Item WHERE id = ?', [id]);
    }
    
    listItemsByParentId(parentId) {
      return this.list('SELECT id, data FROM Item WHERE parentId = ? order by orderIndex', [parentId]);
    }
    
    insertItem(id, parentId, data, orderIndex) {
      return this.executeSql('INSERT INTO Item (id, parentId, data, orderIndex) VALUES (?, ?, ?, ?)', [id, parentId, data, orderIndex]);
    }
    
    updateItem(id, parentId, data, orderIndex) {
      return this.executeSql('UPDATE Item SET data = ?, parentId = ?, orderIndex = ? WHERE id = ?', [data, parentId, orderIndex, id]);
    }
    
    upsertItem(id, parentId, data, orderIndex) {
      return this.findItemById(id)
        .then((row) => {
          if (row) {
            return this.updateItem(id, parentId, data, orderIndex);
          } else {
            return this.insertItem(id, parentId, data, orderIndex);
          }
        });
    }
    
    deleteItem(id) {
      return this.executeSql("DELETE FROM Item WHERE id = ?", [id]);
    }
    
  } 
  
  $.widget("custom.essoteMobile", {
    
    options: {
      maxLevel: 5,
      touchSlideSlack: 10,
      queue: {
        initialTimeout: 100,
        timeout: 2000
      }
    },

    _create : function() {
      SoteapiClient.ApiClient.instance.basePath = 'https://essote-soteapi.metatavu.io/v1';
      this.queueTimeout = this.options.queue.initialTimeout;
      
      this._rootController = new RootContentController();
      this._controllerStack = [this._rootController];
      this._itemDatabase = this.options.itemDatabase;
      
      this.element.find('.swiper-wrapper').append(this._getActiveController().getHtml());
      
      this._swiper = new Swiper('.swiper-container', { });
      this._swiper.on('slideChangeTransitionStart', this._onSlideChangeTransitionStart.bind(this));
      this._swiper.on('slidePrevTransitionEnd', this._onSlidePrevTransitionEnd.bind(this));
      this._swiper.on('slideNextTransitionEnd', this._onSlideNextTransitionEnd.bind(this));
 
      this.element.on('touchend', '.back-btn', $.proxy(this._onBackBtnTouchEnd, this));
      this.element.on('touchstart', '.list-link', $.proxy(this._onListItemTouchStart, this));
      this.element.on('touchend', '.list-link', $.proxy(this._onListItemTouchEnd, this));
      this.element.on('itemChange', $.proxy(this._onItemChange, this));
      this.element.on('itemDelete', $.proxy(this._onItemDelete, this));
      
      this._swiper.slideNext();
      this._refreshPage();
      
      this._taskQueue = async.priorityQueue(this._onTaskQueueCallback.bind(this), 1);
      this._taskQueue.drain = this._onTaskQueueDrain.bind(this);
      this._taskQueue.push({type: 'item', 'itemController': this._rootController}, 0);
      
      $(window).resize(this._onWindowResize.bind(this));
      
      $(document).on("backbutton", $.proxy(this._onBackButtonClick, this));
      $(document).on("pause", $.proxy(this._onPause, this));
      $(document).on("resume", $.proxy(this._onResume, this));
      
      if (window.FirebasePlugin) {
        window.FirebasePlugin.subscribe('events', function() {
          console.log("Subscribed to events");
        });
        
        window.FirebasePlugin.subscribe('news', function() {
          console.log("Subscribed to news");
        });
        
        window.FirebasePlugin.onNotificationOpen((notification) => {
          console.log("Received push notification");
        }, (error) => {
            console.error(error);
        });
      }
    },
    
    _onWindowResize: function () {
      this._getActiveController().onScreenResize($('.swiper-slide-active .content-page-content'));
    },
    
    _getActiveController: function () {
      return this._controllerStack[this._controllerStack.length - 1];
    },
    
    _onSlideChangeTransitionStart: function () {
      this._sliding = true;
      if (this._controllerStack.length <= (this._swiper.activeIndex + 1)) {
        if ($('.list-link.active').length) {
          this._slideToItem($('.list-link.active'));
        }
      }
    },
    
    _onSlidePrevTransitionEnd: function () {
      this._sliding = false;
      if (this._controllerStack.length > (this._swiper.activeIndex + 1)) {
        this._controllerStack.pop();
        
        const slidesToRemove = [];
        for (let i = this._swiper.activeIndex + 1; i <= this.options.maxLevel; i++) {
          slidesToRemove.push(i);
        }

        this._swiper.removeSlide(slidesToRemove);
      }
      
      this._refreshPage();
    },
    
    _onSlideNextTransitionEnd: function () {
      this._sliding = false;
      this._refreshPage();
    },
    
    _onBackButtonClick: function (event) {
      if (this._controllerStack.length > 1) {
        this._swiper.slidePrev();
      } else {
        navigator.app.exitApp();
      }
    },
    
    _onPause: function () {
      this._taskQueue.pause();
    },
    
    _onResume: function () {
      this._taskQueue.resume();
    },
    
    _onTaskQueueCallback: function (task, callback) {
      switch (task.type) {
        case 'item':
          this._persistItem(task.itemController, task.orderIndex).then(() => {
            task.itemController.getChildren().then((children) => {
              const parentId = task.itemController.getId();
              const childIds = [];
              
              children.forEach((child, index) => {
                this._taskQueue.push({
                  type: 'item', 
                  itemController: child, 
                  orderIndex: index
                }, 0);
                
                childIds.push(child.getId());
              });
              
              this._itemDatabase.listItemsByParentId(parentId)
                .then((existing) => {
                  const deletedChildren = existing.filter((existing) => {
                    return childIds.indexOf(existing.id) === -1;
                  });
                  
                  deletedChildren.forEach((deletedChild) => {
                    this._deleteItem(parentId, deletedChild.id);
                  });
                });

              setTimeout(() => {
                callback();
              }, this.queueTimeout);
            });
          });
        break;
      }
    },
    
    _onTaskQueueDrain: function () {
      this.queueTimeout = this.options.queue.timeout;
      this._taskQueue.push({
        type: 'item', 
        itemController: this._rootController,
        orderIndex: 0
      }, 0);
    },
    
    _findStoredItem: function (id) {
      return new Promise((resolve) => {
        return this._itemDatabase.findItemById(id)
          .then((item) => {
            resolve(item ? JSON.parse(item.data) : null);
          })
          .catch((err) => {
            console.error(`Failed to retrieve persisted item ${id}`, err);
            resolve(null);
          });
      });
    },
    
    _upsertStoredItem: function (id, parentId, item, orderIndex) {
      return new Promise((resolve) => {
        return this._itemDatabase.upsertItem(id, parentId, JSON.stringify(item), orderIndex)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            console.error(`Failed to persist item ${id}`, err);
            resolve();
          });
      });
    },
    
    _persistItem: function (itemController, orderIndex) {
      const id = itemController.getId();
      const parentId = itemController.getParentId();
      const newItem = itemController.getItem();
      if (!newItem) {
        return new Promise((resolve) => {
          resolve();
        });
      }
      
      return this._findStoredItem(id).then((result) => {
        const oldItem = result;
        if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          return this._upsertStoredItem(id, parentId, newItem, orderIndex)
            .then(() => {
              this.element.trigger('itemChange', {
                itemController: itemController
              });
              
              return null;
            });
          } else {
            return null;
          }
      });
    },
    
    _deleteItem: function (parentId, itemId) {
      this._itemDatabase.deleteItem(itemId)
        .then(() => {
          this.element.trigger('itemDelete', {
            parentId: parentId
          });
        });
    },
    
    _getItemController: function (parentController, id) {
      return this._findStoredItem(id)
        .then((item) => {
          if (item) {
            return ContentControllerFactory.createContentController(item.type, parentController, item);
          } else {
            console.error(`Could not find item by id ${id}`);
            return null;
          }
        });
    },
    
    _listByParent: function (parentController) {
      return new Promise((resolve) => {
        this._itemDatabase.listItemsByParentId(parentController.getId())
          .then((results) => {
            resolve(results.map((result) => {
              const item = JSON.parse(result.data);
              return ContentControllerFactory.createContentController(item.type, parentController, item);
            }));
          })
          .catch(() => {
            resolve([]);
          });
      });
    },
    
    _refreshChildPages: function () {
      return new Promise((resolve) => {
        $('.swiper-slide-active .child-items-container').empty();
        this._listByParent(this._getActiveController()).then((childPages) => {
          childPages.forEach((childPage) => {
            const itemHtml = this._getActiveController().getChildListItemHtml(childPage);
            $('.swiper-slide-active .child-items-container').append(itemHtml);
          });
          
          resolve();
        });
      });
    },
    
    _refreshPage: function () {
      this._refreshChildPages().then(() => {
        this._getActiveController().onBeforePageRefresh($('.swiper-slide-active .content-page-content'));
        $('.swiper-slide-active .content-page-content').html(this._getActiveController().getContentHtml());
        this._getActiveController().onAfterPageRefresh($('.swiper-slide-active .content-page-content'));        
      });
    },
    
    _getTouchPosition: function (event) {
      const touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
      return {
        x: touch.pageX,
        y: touch.pageY
      };
    },
    
    _slideToItem: function (item) {
      item.addClass('active');
      
      const listItemId = item.attr('data-id');
      const listItemLevel = parseInt(item.attr('data-level'), 10);
      
      this._getItemController(this._getActiveController(), listItemId)
        .then((itemController) => {
          this._controllerStack.push(itemController);

          const slidesToRemove = [];
          for (let i = listItemLevel + 1; i <= this.options.maxLevel; i++) {
            slidesToRemove.push(i);
          }

          this._swiper.removeSlide(slidesToRemove);
          this._swiper.appendSlide(this._getActiveController().getHtml());
          this._swiper.slideNext();
        });
      
      $('.list-link').removeClass('active');
    },
    
    _onItemChange: function (event, data) {
      const itemController = data.itemController;
      const id = itemController.getId();
      const parentId = itemController.getParentId();
      
      if (parentId === this._getActiveController().getId() || id === this._getActiveController().getId()) {
        this._refreshPage();
      }
    },
    
    _onItemDelete: function (event, data) {
      const parentId = data.parentId;
      
      if (parentId === this._getActiveController().getId()) {
        this._refreshPage();
      }
    },
    
    _onListItemTouchStart: function(event) {
      if (this._sliding) {
        return;
      }
      
      this._listItemTouchPos = this._getTouchPosition(event);
      
      const item = $(event.target).closest('.list-link');      
      $('.list-link').removeClass('active');
      item.addClass('active');
    },
    
    _onListItemTouchEnd: function(event) {
      if (this._sliding) {
        return;
      }
      
      const touchPos = this._getTouchPosition(event);
      $('.list-link').removeClass('active');
      
      if (Math.abs(this._listItemTouchPos.y - touchPos.y) > this.options.touchSlideSlack) {
        return;  
      }
      
      const item = $(event.target).closest('.list-link');      
      this._slideToItem(item);
    },
    
    _onBackBtnTouchEnd: function(e) {
      this._swiper.slidePrev();
    }
    
  });
  
  $(document).on("deviceready", () => {
    moment.locale('fi');
  
    const itemDatabase = new ItemDatabase();
    itemDatabase.initialize()
      .then(() => {    
        $(document.body).essoteMobile({
          itemDatabase: itemDatabase
        });
      })
      .catch((err) => {
        console.error(err);
      });
  });

})();