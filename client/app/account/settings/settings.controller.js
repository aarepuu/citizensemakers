'use strict';

class SettingsController {

  constructor(Auth) {
    this.Auth = Auth;
    this.isConnected = Auth.isConnected;
    this.now = new Date();

    this.dropzoneConfig = {
      parallelUploads: 3,
      maxFileSize: 30,
      url: '/'
    }
  }

  dzAddedFile(file) {
    console.log(file);
  }

  dzError(file, errorMessage) {
    console.log(errorMessage);
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
