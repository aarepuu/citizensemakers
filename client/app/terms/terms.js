'use strict';

angular.module('citizensemakersApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('terms', {
        url: '/terms',
        template: '<terms></terms>'
      });
  });
