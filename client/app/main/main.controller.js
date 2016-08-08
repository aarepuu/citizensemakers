'use strict';

(function () {

  class MainController {

    constructor($http, $scope, socket, Auth) {
      this.$http = $http;
      this.socket = socket;
      this.$scope = $scope;
      this.isLoggedIn = Auth.isLoggedIn;
      this.isConnected = Auth.isConnected;
      this.getCurrentUser = Auth.getCurrentUser;
      this.lastSync = this.getCurrentUser().lastSync;
      this.me = Auth.getCurrentUser()._id;
      this.showData = false;

      //this.getCurrentUser = Auth.getCurrentUser();

      this.$scope.$watch("main.lastSync", function(val){
        console.log(val);
      });

    }

    showFitbit() {
      return this.isLoggedIn() ? (this.isConnected() ? false : true) : false;
    }

    showData() {
      if(typeof(this.lastSync) == 'undefined') return false;
      return (this.isLoggedIn() && this.isConnected() && this.lastSync.length != 0) ? true : false;
    }

    $onInit() {

    }
    //ISODate("2016-08-01T23:00:00.000Z")
  }


  angular.module('citizensemakersApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController,
      controllerAs: 'main',
    });
})();
