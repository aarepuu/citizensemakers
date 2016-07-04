'use strict';

describe('Directive: columnChart', function () {

  // load the directive's module
  beforeEach(module('charts'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<column-chart></column-chart>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the columnChart directive');
  }));
});
