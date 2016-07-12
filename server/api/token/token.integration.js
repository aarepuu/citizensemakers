'use strict';

var app = require('../..');
import request from 'supertest';

var newToken;

describe('Token API:', function() {

  describe('GET /api/token', function() {
    var tokens;

    beforeEach(function(done) {
      request(app)
        .get('/api/token')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          tokens = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      tokens.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/token', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/token')
        .send({
          name: 'New Token',
          info: 'This is the brand new token!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newToken = res.body;
          done();
        });
    });

    it('should respond with the newly created token', function() {
      newToken.name.should.equal('New Token');
      newToken.info.should.equal('This is the brand new token!!!');
    });

  });

  describe('GET /api/token/:id', function() {
    var token;

    beforeEach(function(done) {
      request(app)
        .get('/api/token/' + newToken._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          token = res.body;
          done();
        });
    });

    afterEach(function() {
      token = {};
    });

    it('should respond with the requested token', function() {
      token.name.should.equal('New Token');
      token.info.should.equal('This is the brand new token!!!');
    });

  });

  describe('PUT /api/token/:id', function() {
    var updatedToken;

    beforeEach(function(done) {
      request(app)
        .put('/api/token/' + newToken._id)
        .send({
          name: 'Updated Token',
          info: 'This is the updated token!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedToken = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedToken = {};
    });

    it('should respond with the updated token', function() {
      updatedToken.name.should.equal('Updated Token');
      updatedToken.info.should.equal('This is the updated token!!!');
    });

  });

  describe('DELETE /api/token/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/token/' + newToken._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when token does not exist', function(done) {
      request(app)
        .delete('/api/token/' + newToken._id)
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
