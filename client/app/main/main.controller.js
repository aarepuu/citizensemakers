'use strict';

(function () {

  class MainController {

    constructor($http, $scope, socket, Auth) {
      this.$http = $http;
      this.socket = socket;
      this.isLoggedIn = Auth.isLoggedIn;
      this.isConnected = Auth.isConnected;
      this.currentuser = Auth.getCurrentUser();
      this.me = Auth.getCurrentUser()._id;
      var self = this;

      $scope.$watch('main',function (val) {
        console.log("watch main");
        self.me = Auth.getCurrentUser()._id
      });
    }

    showFitbit() {
      return this.isLoggedIn() ? (this.isConnected() ? false : true) : false;
    }

    showData() {
      return this.isLoggedIn() ? (this.isConnected() ? true : false) : false;
    }

    $onInit() {

    }

  }


  angular.module('citizensemakersApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController,
      controllerAs: 'main',
    });
})();
