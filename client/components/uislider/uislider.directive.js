'use strict';

angular.module('citizensemakersApp')
  .directive('uislider', function () {
    return {
      restrict: 'A',
      scope: {
        ngModel: '=',
        min: '@',
        max: '@',
        step: '@?',
        connect: '=?',
        tooltips: '=?',
        slide: '&slide'
      },
      link: function (scope, element, attrs) {
        noUiSlider.create(element[0], {
          start: scope.ngModel || 0,
          step: parseFloat(scope.step || 1),
          tooltips: angular.isDefined(scope.connect) ? scope.tooltips : undefined,
          connect: angular.isDefined(scope.connect) ? scope.connect : 'lower',
          range: {
            'min': parseFloat(scope.min || 0),
            'max': parseFloat(scope.max || 100),
          },
          format: {
            to: function (number) {
              return Math.round(number * 100) / 100;
            },
            from: function (number) {
              return Number(number);
            }
          }
        });

        /*element[0].noUiSlider.on('change', function (values, input) {
         scope.ngModel = values;
         scope.$apply();
         });*/

        element[0].noUiSlider.on('change', function (values, input) {
          //console.log(i)
          //Write values to model
          scope.ngModel = values;
          scope.$apply();
          //call controller function, don't really need args because it's connected to model
          scope.slide({args: values, element: input});
          //scope.$apply();
        });
      }
    };
  });
