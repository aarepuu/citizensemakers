'use strict';

(function () {

  class DataController {


    constructor(Auth,$scope) {
      this.Auth = Auth;
      this.$scope = $scope;
      var currentTime = new Date();
      this.currentTime = currentTime;
      this.month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      this.monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      this.weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      this.weekdaysLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      this.disable = [false, 1, 7];
      this.today = 'Today';
      this.clear = 'Clear';
      this.close = 'Close';
      var days = 15;
      this.minDate = (new Date(this.currentTime.getTime() - ( 1000 * 60 * 60 *24 * days ))).toISOString();
      this.maxDate = (new Date(this.currentTime.getTime() + ( 1000 * 60 * 60 *24 * days ))).toISOString();
      this.slider = {
        minValue: 10,
        maxValue: 90,
        options: {
          floor: 0,
          ceil: 100,
          step: 1
        }
      }

      this.options = {width: 500, height: 300, 'bar': 'aaa'};
      this.data = [1, 2, 3, 4];
      this.barValue = 'None';

    }

    hovered(d){
      this.barValue = d;
      this.$scope.$apply();
    }
    clicked(d){
      console.log(d);
    }


  }

  angular.module('citizensemakersApp')
    .controller('DataController', DataController);

})();
