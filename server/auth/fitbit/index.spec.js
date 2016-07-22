'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var fitbitCtrlStub = {
  index: 'fitbitCtrl.index',
  show: 'fitbitCtrl.show',
  create: 'fitbitCtrl.create',
  update: 'fitbitCtrl.update',
  destroy: 'fitbitCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var fitbitIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './fitbit.controller': fitbitCtrlStub
});

describe('Fitbit API Router:', function() {

  it('should return an express router instance', function() {
    fitbitIndex.should.equal(routerStub);
  });

  describe('GET /auth/fitbit', function() {

    it('should route to fitbit.controller.index', function() {
      routerStub.get
        .withArgs('/', 'fitbitCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /auth/fitbit/:id', function() {

    it('should route to fitbit.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'fitbitCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /auth/fitbit', function() {

    it('should route to fitbit.controller.create', function() {
      routerStub.post
        .withArgs('/', 'fitbitCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /auth/fitbit/:id', function() {

    it('should route to fitbit.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'fitbitCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /auth/fitbit/:id', function() {

    it('should route to fitbit.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'fitbitCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /auth/fitbit/:id', function() {

    it('should route to fitbit.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'fitbitCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
