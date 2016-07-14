'use strict';

var app = require('../..');
import request from 'supertest';

var newHeart;

describe('Heart API:', function() {

  describe('GET /api/hearts', function() {
    var hearts;

    beforeEach(function(done) {
      request(app)
        .get('/api/hearts')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          hearts = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      hearts.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/hearts', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/hearts')
        .send({
          name: 'New Heart',
          info: 'This is the brand new heart!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newHeart = res.body;
          done();
        });
    });

    it('should respond with the newly created heart', function() {
      newHeart.name.should.equal('New Heart');
      newHeart.info.should.equal('This is the brand new heart!!!');
    });

  });

  describe('GET /api/hearts/:id', function() {
    var heart;

    beforeEach(function(done) {
      request(app)
        .get('/api/hearts/' + newHeart._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          heart = res.body;
          done();
        });
    });

    afterEach(function() {
      heart = {};
    });

    it('should respond with the requested heart', function() {
      heart.name.should.equal('New Heart');
      heart.info.should.equal('This is the brand new heart!!!');
    });

  });

  describe('PUT /api/hearts/:id', function() {
    var updatedHeart;

    beforeEach(function(done) {
      request(app)
        .put('/api/hearts/' + newHeart._id)
        .send({
          name: 'Updated Heart',
          info: 'This is the updated heart!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedHeart = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedHeart = {};
    });

    it('should respond with the updated heart', function() {
      updatedHeart.name.should.equal('Updated Heart');
      updatedHeart.info.should.equal('This is the updated heart!!!');
    });

  });

  describe('DELETE /api/hearts/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/hearts/' + newHeart._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when heart does not exist', function(done) {
      request(app)
        .delete('/api/hearts/' + newHeart._id)
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
