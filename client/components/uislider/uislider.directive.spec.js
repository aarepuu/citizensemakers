'use strict';

describe('Directive: uislider', function () {

  // load the directive's module
  beforeEach(module('citizensemakersApp.uislider'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<uislider></uislider>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the uislider directive');
  }));
});
