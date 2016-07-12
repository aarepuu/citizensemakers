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
        tooltips: '=?'
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

          element[0].noUiSlider.on('change', function (values, input) {
            //console.log(element[0]);
            scope.ngModel = values;
            //console.log(values);
            scope.$apply();
          });
      }
    };
  });
