'use strict';

angular.module('citizensemakersApp', ['d3', 'ngMaterial', 'ngMessages',   'angular-scrolled', 'citizensemakersApp.auth', 'citizensemakersApp.admin',
    'citizensemakersApp.constants', 'ngCookies', 'ngResource', 'ngSanitize', 'btford.socket-io',
    'ui.router', 'ui.bootstrap', 'validation.match'
  ])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
  });
