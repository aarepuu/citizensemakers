'use strict';

class SettingsController {

  constructor($scope, $http, $filter, Auth, User) {
    this.$scope = $scope;
    this.$http = $http;
    this.Auth = Auth;
    this.$filter = $filter;
    this.isConnected = this.Auth.isConnected;

    this.dropzoneConfig = {
      parallelUploads: 3,
      maxFileSize: 30,
      url: '/'
    }

    this.connect = true;
    this.value = [9, 17];
    this.weeksvalue = [9, 17];

    //TODO - change names of these
    //problem with getting rights sometimes

    this.getCurrentUser = this.Auth.getCurrentUser();
    var self = this;
    //to get rid of racing conditions
    this.$scope.$watch("vm.getCurrentUser.rights", function (val) {
      if (typeof val != 'undefined') {
        //TODO - change the names of right arrays. make it more explicit
        self.rights = self.getCurrentUser.rights.them;
        self.lastSync = self.getCurrentUser.lastSync;
      }
    });
    //this.rights = this.Auth.getCurrentUser().rights.them;
    this.users = null;


    //get the list of users for right managment
    this.$http.get('/api/users/all').then(response => {
      this.users = response.data;
    });

    //default rights values
    this.defaultrights = {
      "weekendtime": [0, 23],
      "weektime": [0, 23],
      "weekend": false,
      "week": false
    };

  }


  dzAddedFile(file) {
    console.log(file);
  }

  dzError(file, errorMessage) {
    console.log(errorMessage);
  }

  check(box, user, value) {
    /*http.post("/echo/json/", data).success(function(data, status) {
     $scope.hello = data;
     })
     this.$http.post("/api/data/hearts/", right).then(response => {
     this.steps = response.data;
     });*/
    //console.log(box);
    //console.log(user);
    //console.log(value);
    console.log(this.rights);
  }

  slide(args, element, user){
    console.log(this.rights);
  }
  //Get rights for specific user
  getRights(userId, fitbitId, name) {
    //console.log(user);
    var userinfo = this.$filter('filter')(this.rights, {userId: userId})[0];
    if (userinfo) {
      return userinfo;
    }
    //TODO - look over this cloning
    var defaultrights = JSON.parse(JSON.stringify(this.defaultrights));
    defaultrights.userId = userId;
    defaultrights.fitbitId = fitbitId;
    defaultrights.name = name;
    this.rights.push(defaultrights);
    return defaultrights;
  }
  setRights(user,right){
    console.log(right);
    //console.log(this.rights);
    //TODO - fix this 2 query hack
    this.$http.post("/api/users/rights", this.rights).then(response => {
      console.log("Rights set");
    });
    this.$http.post("/api/users/right", right).then(response => {
      console.log("Right set");
    });

  }

  changePassword(form) {
    this.submitted = true;

    if (form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then(() => {
          this.message = 'Password successfully changed.';
        })
        .catch(() => {
          form.password.$setValidity('mongoose', false);
          this.errors.other = 'Incorrect password';
          this.message = '';
        });
    }
  }
}

angular.module('citizensemakersApp')
  .controller('SettingsController', SettingsController);
