'use strict';

describe('Component: TermsComponent', function () {

  // load the controller's module
  beforeEach(module('citizensemakersApp'));

  var TermsComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    TermsComponent = $componentController('terms', {});
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
