'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var stepCtrlStub = {
  index: 'stepCtrl.index',
  show: 'stepCtrl.show',
  create: 'stepCtrl.create',
  update: 'stepCtrl.update',
  destroy: 'stepCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var stepIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './step.controller': stepCtrlStub
});

describe('Step API Router:', function() {

  it('should return an express router instance', function() {
    stepIndex.should.equal(routerStub);
  });

  describe('GET /api/data/steps', function() {

    it('should route to step.controller.index', function() {
      routerStub.get
        .withArgs('/', 'stepCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/data/steps/:id', function() {

    it('should route to step.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'stepCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/data/steps', function() {

    it('should route to step.controller.create', function() {
      routerStub.post
        .withArgs('/', 'stepCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/data/steps/:id', function() {

    it('should route to step.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'stepCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/data/steps/:id', function() {

    it('should route to step.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'stepCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/data/steps/:id', function() {

    it('should route to step.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'stepCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
