'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var rightCtrlStub = {
  index: 'rightCtrl.index',
  show: 'rightCtrl.show',
  create: 'rightCtrl.create',
  update: 'rightCtrl.update',
  destroy: 'rightCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var rightIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './right.controller': rightCtrlStub
});

describe('Right API Router:', function() {

  it('should return an express router instance', function() {
    rightIndex.should.equal(routerStub);
  });

  describe('GET /api/rights', function() {

    it('should route to right.controller.index', function() {
      routerStub.get
        .withArgs('/', 'rightCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/rights/:id', function() {

    it('should route to right.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'rightCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/rights', function() {

    it('should route to right.controller.create', function() {
      routerStub.post
        .withArgs('/', 'rightCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/rights/:id', function() {

    it('should route to right.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'rightCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/rights/:id', function() {

    it('should route to right.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'rightCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/rights/:id', function() {

    it('should route to right.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'rightCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
