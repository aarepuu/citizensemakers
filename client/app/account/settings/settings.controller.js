'use strict';

class SettingsController {

  constructor($http, Auth, User) {
    this.$http = $http;
    this.Auth = Auth;
    this.isConnected = Auth.isConnected;
    this.now = new Date();

    this.dropzoneConfig = {
      parallelUploads: 3,
      maxFileSize: 30,
      url: '/'
    }

    this.connect = true;
    this.value = [9,17];
    this.weeksvalue = [9,17];

    this.users = null;
    this.$http.get('/api/users/all').then(response => {
      this.users = response.data;
    });

  }


  dzAddedFile(file) {
    console.log(file);
  }

  dzError(file, errorMessage) {
    console.log(errorMessage);
  }

  check(box,user, el){
    console.log(box);
    console.log(user);
    console.log(el);
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
