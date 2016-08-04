'use strict';

(function () {

  class MainController {

    constructor($http, $scope, socket, Auth) {
      this.$http = $http;
      this.socket = socket;
      this.isLoggedIn = Auth.isLoggedIn;
      this.isConnected = Auth.isConnected;
      this.awesomeThings = [];
      this.currentuser = Auth.getCurrentUser();
      this.me = null;
      var self = this;
      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('thing');
      });
      $scope.$watch('main.currentuser',function (val) {
        self.me = self.currentuser._id
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
