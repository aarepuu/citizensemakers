'use strict';

class SettingsController {

  constructor($http, $filter, Auth, User) {
    this.$http = $http;
    this.Auth = Auth;
    this.$filter = $filter;
    this.isConnected = Auth.isConnected;
    this.now = new Date();

    this.dropzoneConfig = {
      parallelUploads: 3,
      maxFileSize: 30,
      url: '/'
    }

    this.connect = true;
    this.value = [9, 17];
    this.weeksvalue = [9, 17];


    this.rights = this.Auth.getCurrentUser().rights.them;
    //console.log(this.Auth.getCurrentUser().rights.them);

    this.users = null;
    this.$http.get('/api/users/all').then(response => {
      //console.log(response.data);
      this.users = response.data;
    });

    this.defaultrights = {
      "weekendtime": [0, 24],
      "weektime": [0, 24],
      "weekend": false,
      "week": false
    }

  }


  dzAddedFile(file) {
    console.log(file);
  }

  dzError(file, errorMessage) {
    console.log(errorMessage);
  }

  check(box, user, el) {
    /*http.post("/echo/json/", data).success(function(data, status) {
     $scope.hello = data;
     })*/
  }

  getRights(user, name) {
    var user = this.$filter('filter')(this.rights, {user: user})[0];
    if(user) {
      return user;
    }
    var defaultrights = this.defaultrights;
    defaultrights.user = user;
    defaultrights.name = name;
    return defaultrights;
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
