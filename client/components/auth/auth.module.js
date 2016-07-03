'use strict';

angular.module('citizensemakersApp.auth', ['citizensemakersApp.constants',
    'citizensemakersApp.util', 'ngCookies', 'ui.router'
  ])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
