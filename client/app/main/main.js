'use strict';

angular.module('citizensemakersApp')
  .config(function($stateProvider) {
    $stateProvider.state('main', {
      url: '/',
      template: '<main></main>'
    });
  });
