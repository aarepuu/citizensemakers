'use strict';

var app = require('../..');
import request from 'supertest';

var newSleep;

describe('Sleep API:', function() {

  describe('GET /api/data/sleeps', function() {
    var sleeps;

    beforeEach(function(done) {
      request(app)
        .get('/api/data/sleeps')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          sleeps = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      sleeps.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/data/sleeps', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/data/sleeps')
        .send({
          name: 'New Sleep',
          info: 'This is the brand new sleep!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newSleep = res.body;
          done();
        });
    });

    it('should respond with the newly created sleep', function() {
      newSleep.name.should.equal('New Sleep');
      newSleep.info.should.equal('This is the brand new sleep!!!');
    });

  });

  describe('GET /api/data/sleeps/:id', function() {
    var sleep;

    beforeEach(function(done) {
      request(app)
        .get('/api/data/sleeps/' + newSleep._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          sleep = res.body;
          done();
        });
    });

    afterEach(function() {
      sleep = {};
    });

    it('should respond with the requested sleep', function() {
      sleep.name.should.equal('New Sleep');
      sleep.info.should.equal('This is the brand new sleep!!!');
    });

  });

  describe('PUT /api/data/sleeps/:id', function() {
    var updatedSleep;

    beforeEach(function(done) {
      request(app)
        .put('/api/data/sleeps/' + newSleep._id)
        .send({
          name: 'Updated Sleep',
          info: 'This is the updated sleep!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedSleep = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedSleep = {};
    });

    it('should respond with the updated sleep', function() {
      updatedSleep.name.should.equal('Updated Sleep');
      updatedSleep.info.should.equal('This is the updated sleep!!!');
    });

  });

  describe('DELETE /api/data/sleeps/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/data/sleeps/' + newSleep._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when sleep does not exist', function(done) {
      request(app)
        .delete('/api/data/sleeps/' + newSleep._id)
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
