'use strict';

(function(){

class TermsComponent {
  constructor($rootScope, $location, $anchorScroll) {
    this.message = 'Hello';
    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
      if($location.hash()) $anchorScroll();
    });
  }
}

angular.module('citizensemakersApp')
  .component('terms', {
    templateUrl: 'app/terms/terms.html',
    controller: TermsComponent,
    controllerAs: 'terms'
  });

})();
