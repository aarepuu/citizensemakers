'use strict';

(function () {

  class DataController {


    constructor(Auth) {
      this.Auth = Auth;
      this.enabled = true;
      this.test = 'Hello';
      this.items = [];
      this.windowItems = [];
      this.hItems = [];
      this.more();
      this.windowMore();

      this.myDate = new Date();
      this.minDate = new Date(this.myDate.getFullYear(),
        this.myDate.getMonth() - 2,
        this.myDate.getDate());
      this.maxDate = new Date(
        this.myDate.getFullYear(),
        this.myDate.getMonth() + 2,
        this.myDate.getDate());

    }

    onlyWeekendsPredicate(date) {
      var day = date.getDay();
      return day === 0 || day === 6;
    }

    more() {
      var i = 0;
      var limit = 20;

      for (; i < limit; i++) {
        this.items.push({name: 'item ' + (this.items.length + 1)});
      }
    }

    windowMore() {

      var i = 0;
      var limit = 20;

      for (; i < limit; i++) {
        this.windowItems.push({name: 'item ' + (this.windowItems.length + 1)});
      }
    }


  }

  angular.module('citizensemakersApp')
    .controller('DataController', DataController);

})();
