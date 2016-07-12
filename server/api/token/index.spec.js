'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var tokenCtrlStub = {
  index: 'tokenCtrl.index',
  show: 'tokenCtrl.show',
  create: 'tokenCtrl.create',
  update: 'tokenCtrl.update',
  destroy: 'tokenCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var tokenIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './token.controller': tokenCtrlStub
});

describe('Token API Router:', function() {

  it('should return an express router instance', function() {
    tokenIndex.should.equal(routerStub);
  });

  describe('GET /api/token', function() {

    it('should route to token.controller.index', function() {
      routerStub.get
        .withArgs('/', 'tokenCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/token/:id', function() {

    it('should route to token.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'tokenCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/token', function() {

    it('should route to token.controller.create', function() {
      routerStub.post
        .withArgs('/', 'tokenCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/token/:id', function() {

    it('should route to token.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'tokenCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/token/:id', function() {

    it('should route to token.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'tokenCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/token/:id', function() {

    it('should route to token.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'tokenCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
