'use strict';

var app = require('../..');
import request from 'supertest';

var newStep;

describe('Step API:', function() {

  describe('GET /api/data/steps', function() {
    var steps;

    beforeEach(function(done) {
      request(app)
        .get('/api/data/steps')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          steps = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      steps.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/data/steps', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/data/steps')
        .send({
          name: 'New Step',
          info: 'This is the brand new step!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newStep = res.body;
          done();
        });
    });

    it('should respond with the newly created step', function() {
      newStep.name.should.equal('New Step');
      newStep.info.should.equal('This is the brand new step!!!');
    });

  });

  describe('GET /api/data/steps/:id', function() {
    var step;

    beforeEach(function(done) {
      request(app)
        .get('/api/data/steps/' + newStep._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          step = res.body;
          done();
        });
    });

    afterEach(function() {
      step = {};
    });

    it('should respond with the requested step', function() {
      step.name.should.equal('New Step');
      step.info.should.equal('This is the brand new step!!!');
    });

  });

  describe('PUT /api/data/steps/:id', function() {
    var updatedStep;

    beforeEach(function(done) {
      request(app)
        .put('/api/data/steps/' + newStep._id)
        .send({
          name: 'Updated Step',
          info: 'This is the updated step!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedStep = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedStep = {};
    });

    it('should respond with the updated step', function() {
      updatedStep.name.should.equal('Updated Step');
      updatedStep.info.should.equal('This is the updated step!!!');
    });

  });

  describe('DELETE /api/data/steps/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/data/steps/' + newStep._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when step does not exist', function(done) {
      request(app)
        .delete('/api/data/steps/' + newStep._id)
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
