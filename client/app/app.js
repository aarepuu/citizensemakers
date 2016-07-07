'use strict';

angular.module('citizensemakersApp', ['d3', 'ngDropzone', 'citizensemakersApp.auth', 'citizensemakersApp.auth', 'citizensemakersApp.admin',
    'citizensemakersApp.constants', 'ngCookies', 'ngResource', 'ngSanitize', 'btford.socket-io',
    'ui.router', 'ui.bootstrap', 'validation.match', 'ui.materialize', 'rzModule', 'charts'
  ])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
  });
