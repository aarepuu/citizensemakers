'use strict';

var app = require('../..');
import request from 'supertest';

var newData;

describe('Data API:', function() {

  describe('GET /api/data', function() {
    var datas;

    beforeEach(function(done) {
      request(app)
        .get('/api/data')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          datas = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      datas.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/data', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/data')
        .send({
          name: 'New Data',
          info: 'This is the brand new data!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newData = res.body;
          done();
        });
    });

    it('should respond with the newly created data', function() {
      newData.name.should.equal('New Data');
      newData.info.should.equal('This is the brand new data!!!');
    });

  });

  describe('GET /api/data/:id', function() {
    var data;

    beforeEach(function(done) {
      request(app)
        .get('/api/data/' + newData._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          data = res.body;
          done();
        });
    });

    afterEach(function() {
      data = {};
    });

    it('should respond with the requested data', function() {
      data.name.should.equal('New Data');
      data.info.should.equal('This is the brand new data!!!');
    });

  });

  describe('PUT /api/data/:id', function() {
    var updatedData;

    beforeEach(function(done) {
      request(app)
        .put('/api/data/' + newData._id)
        .send({
          name: 'Updated Data',
          info: 'This is the updated data!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedData = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedData = {};
    });

    it('should respond with the updated data', function() {
      updatedData.name.should.equal('Updated Data');
      updatedData.info.should.equal('This is the updated data!!!');
    });

  });

  describe('DELETE /api/data/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/data/' + newData._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when data does not exist', function(done) {
      request(app)
        .delete('/api/data/' + newData._id)
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
