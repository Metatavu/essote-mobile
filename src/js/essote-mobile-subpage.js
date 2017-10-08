/* jshint esversion: 6 */
/* global getConfig, EssoteMobileSubPage */

(function(){
  'use strict';
  
  class EssoteMobileSubPage {
    constructor(data, renderFunction) {
      this.data = data;
      this.renderFunction = renderFunction;
    }
    
    render() {
      return this.renderFunction(this.data);
    }
  }

  window.EssoteMobileSubPage = EssoteMobileSubPage;

})();