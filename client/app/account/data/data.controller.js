'use strict';

(function () {

  class DataController {


    constructor($http, $scope, Auth) {
      this.Auth = Auth;
      this.getCurrentUser = Auth.getCurrentUser;
      this.fitbitId = this.getCurrentUser().fitbitId;
      this.$scope = $scope;
      this.$http = $http;
      this.startDate = null;
      this.endDate = null;
      this.month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      this.monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      this.weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      this.weekdaysLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      this.disable = [false, 1, 7];
      this.today = 'Today';
      this.clear = 'Clear';
      this.close = 'Close';
      var days = 15;
      this.steps = [];
      this.interpolate = 'basis';
      this.slider = {
        minValue: 10,
        maxValue: 90,
        options: {
          floor: 0,
          ceil: 100,
          step: 1
        }
      };

      this.options = {width: 500, height: 300, 'bar': 'aaa'};

      this.data = [1, 2, 3, 4];

      this.barValue = 'None';
      this.currentCalValues = [];

      //TODO - build proper component and only fetch data when query parameters change
      //you can only select data from others which you have
      this.$http.get('/api/data/' + this.fitbitId + '/minmax')
        .then(response => {
          this.minDate = (new Date(response.data[0].min * 1000)).toISOString();
          this.maxDate = (new Date(response.data[0].max * 1000)).toISOString();
          this.startDate = this.minDate;
          this.endDate = this.maxDate;
          this.getData();
        });


    }

    $onInit() {
      this.$http.get('/api/data')
        .then(response => {
          console.log(response.data);
        });
    }

    hovered(d) {
      //this.barValue = d;
      //this.$scope.$apply();
      //console.log(d);
    }

    clicked(d) {
      console.log(d);
    }


    //TODO - remove these datepicker stuff to separate file
    onRender() {
      console.log('onRender');
    }

    onOpen(d) {
      console.log('onOpen');
      this.currentCalValues[0] = this.startDate;
      this.currentCalValues[1] = this.endDate;
    }

    onClose() {
      //TODO - there is better way, server side maybe
      //avoid same queries
      if(this.currentCalValues[0] == this.startDate && this.currentCalValues[1] == this.endDate) return;
      this.getData();
    }

    onSet() {
      console.log('onSet');
    }

    onStop() {
      console.log('onStop');
    }

    getData(){
      this.$http.get('/api/data/' + this.fitbitId + '/' + (new Date(this.startDate)).getTime()/1000 + '/' + (new Date(this.endDate)).getTime()/1000)
        .then(response => {
          this.steps = response.data;
        });
    }

  }

  angular.module('citizensemakersApp')
    .controller('DataController', DataController);

})();
