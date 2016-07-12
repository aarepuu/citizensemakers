'use strict';

var app = require('../..');
import request from 'supertest';

var newRight;

describe('Right API:', function() {

  describe('GET /api/rights', function() {
    var rights;

    beforeEach(function(done) {
      request(app)
        .get('/api/rights')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          rights = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      rights.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/rights', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/rights')
        .send({
          name: 'New Right',
          info: 'This is the brand new right!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newRight = res.body;
          done();
        });
    });

    it('should respond with the newly created right', function() {
      newRight.name.should.equal('New Right');
      newRight.info.should.equal('This is the brand new right!!!');
    });

  });

  describe('GET /api/rights/:id', function() {
    var right;

    beforeEach(function(done) {
      request(app)
        .get('/api/rights/' + newRight._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          right = res.body;
          done();
        });
    });

    afterEach(function() {
      right = {};
    });

    it('should respond with the requested right', function() {
      right.name.should.equal('New Right');
      right.info.should.equal('This is the brand new right!!!');
    });

  });

  describe('PUT /api/rights/:id', function() {
    var updatedRight;

    beforeEach(function(done) {
      request(app)
        .put('/api/rights/' + newRight._id)
        .send({
          name: 'Updated Right',
          info: 'This is the updated right!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedRight = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedRight = {};
    });

    it('should respond with the updated right', function() {
      updatedRight.name.should.equal('Updated Right');
      updatedRight.info.should.equal('This is the updated right!!!');
    });

  });

  describe('DELETE /api/rights/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/rights/' + newRight._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when right does not exist', function(done) {
      request(app)
        .delete('/api/rights/' + newRight._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
