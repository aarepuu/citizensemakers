'use strict';

class NavbarController {
  //end-non-standard

  //start-non-standard
  constructor(Auth, $scope) {
    this.$scope = $scope;
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
    this.isConnected = Auth.isConnected;
    this.lastSync = this.getCurrentUser().lastSync;

  }


}

angular.module('citizensemakersApp')
  .controller('NavbarController', NavbarController);
