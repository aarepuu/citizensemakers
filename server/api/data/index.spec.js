'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var dataCtrlStub = {
  index: 'dataCtrl.index',
  show: 'dataCtrl.show',
  create: 'dataCtrl.create',
  update: 'dataCtrl.update',
  destroy: 'dataCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var dataIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './data.controller': dataCtrlStub
});

describe('Data API Router:', function() {

  it('should return an express router instance', function() {
    dataIndex.should.equal(routerStub);
  });

  describe('GET /api/data', function() {

    it('should route to data.controller.index', function() {
      routerStub.get
        .withArgs('/', 'dataCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/data/:id', function() {

    it('should route to data.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'dataCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/data', function() {

    it('should route to data.controller.create', function() {
      routerStub.post
        .withArgs('/', 'dataCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/data/:id', function() {

    it('should route to data.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'dataCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/data/:id', function() {

    it('should route to data.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'dataCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/data/:id', function() {

    it('should route to data.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'dataCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
