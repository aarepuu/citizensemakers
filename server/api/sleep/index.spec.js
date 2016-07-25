'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var sleepCtrlStub = {
  index: 'sleepCtrl.index',
  show: 'sleepCtrl.show',
  create: 'sleepCtrl.create',
  update: 'sleepCtrl.update',
  destroy: 'sleepCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var sleepIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './sleep.controller': sleepCtrlStub
});

describe('Sleep API Router:', function() {

  it('should return an express router instance', function() {
    sleepIndex.should.equal(routerStub);
  });

  describe('GET /api/data/sleeps', function() {

    it('should route to sleep.controller.index', function() {
      routerStub.get
        .withArgs('/', 'sleepCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/data/sleeps/:id', function() {

    it('should route to sleep.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'sleepCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/data/sleeps', function() {

    it('should route to sleep.controller.create', function() {
      routerStub.post
        .withArgs('/', 'sleepCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/data/sleeps/:id', function() {

    it('should route to sleep.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'sleepCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/data/sleeps/:id', function() {

    it('should route to sleep.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'sleepCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/data/sleeps/:id', function() {

    it('should route to sleep.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'sleepCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
