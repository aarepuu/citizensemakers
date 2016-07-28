'use strict';

angular.module('citizensemakersApp', ['d3', 'angularMoment', 'ngDropzone', 'citizensemakersApp.auth', 'citizensemakersApp.admin',
    'citizensemakersApp.constants', 'ngCookies', 'ngResource', 'ngSanitize', 'btford.socket-io',
    'ui.router', 'ui.bootstrap', 'validation.match', 'ui.materialize', 'charts','angular.filter'
  ])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
  });
