'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var heartCtrlStub = {
  index: 'heartCtrl.index',
  show: 'heartCtrl.show',
  create: 'heartCtrl.create',
  update: 'heartCtrl.update',
  destroy: 'heartCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var heartIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './heart.controller': heartCtrlStub
});

describe('Heart API Router:', function() {

  it('should return an express router instance', function() {
    heartIndex.should.equal(routerStub);
  });

  describe('GET /api/hearts', function() {

    it('should route to heart.controller.index', function() {
      routerStub.get
        .withArgs('/', 'heartCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/hearts/:id', function() {

    it('should route to heart.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'heartCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/hearts', function() {

    it('should route to heart.controller.create', function() {
      routerStub.post
        .withArgs('/', 'heartCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/hearts/:id', function() {

    it('should route to heart.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'heartCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/hearts/:id', function() {

    it('should route to heart.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'heartCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/hearts/:id', function() {

    it('should route to heart.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'heartCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
