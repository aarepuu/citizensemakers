'use strict';

(function () {

  class MainController {

    constructor($http, $scope, socket, Auth) {
      this.$http = $http;
      this.socket = socket;
      this.isLoggedIn = Auth.isLoggedIn;
      this.isConnected = Auth.isConnected;
      this.awesomeThings = [];
      this.currentuser = Auth.getCurrentUser()._id;
      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('thing');
      });
    }

    showFitbit() {
      return this.isLoggedIn() ? (this.isConnected() ? false : true) : false;
    }
    showData() {
      return this.isLoggedIn() ? (this.isConnected() ? true : false) : false;
    }

    /*$onInit() {
     this.$http.get('/api/things')
     .then(response => {
     this.awesomeThings = response.data;
     this.socket.syncUpdates('thing', this.awesomeThings);
     });
     }

     addThing() {
     if (this.newThing) {
     this.$http.post('/api/things', {
     name: this.newThing
     });
     this.newThing = '';
     }
     }

     deleteThing(thing) {
     this.$http.delete('/api/things/' + thing._id);
     }*/

    connectFitbit() {
      //console.log("COnnect");
      this.$http.get('/auth/fitbit').then(response => {
        //this.steps = response.data;
      });
    }
  }


  angular.module('citizensemakersApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController,
      controllerAs: 'main',
    });
})();
