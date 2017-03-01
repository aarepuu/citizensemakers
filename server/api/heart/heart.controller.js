/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/hearts              ->  index
 * GET     /api/data/minmax         ->  getMinMax
 * POST    /api/hearts              ->  create
 * GET     /api/hearts/:id          ->  show
 * PUT     /api/hearts/:id          ->  update
 * DELETE  /api/hearts/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Heart from './heart.model';
import Log from '../log/log.model'

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Hearts
export function index(req, res) {
  return Heart.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Heart from the DB
export function show(req, res) {
  return Heart.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Heart in the DB
export function create(req, res) {
  return Heart.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Heart in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Heart.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Heart from the DB
export function destroy(req, res) {
  return Heart.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

//Get max and min value of Heartratedata
export function getMinMax(req, res) {
  return Heart.aggregate([{$match: {"user": req.params.user}}, {
    $group: {
      "_id": "$user",
      "min": {$first: "$time"},
      "max": {$last: "$time"}
    }
  }]).exec()
    //return Data.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}


// Gets all heartrates for one user
export function getData(req, res) {
  return Heart.find({"user": req.params.user}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Get heartrates limited with start end date
export function getDataByDate(req, res) {
  //return Heart.find({"user": req.params.user, "time" : { $gte :  req.params.start, $lte : req.params.end }, "hour": { $gte : 23, $lte : 24 } }).sort( { time: 1 } ).exec()
  return Heart.find({
    "user": req.params.user,
    "time": {$gte: req.params.start, $lte: req.params.end}
  }, '-day -hour').sort({time: 1}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}


// Get allowed data from user
export function limitData(req, res) {
  var query;
  if (req.body.week && !req.body.weekend) {
    query = {
      "user": req.body.fitbitId,
      "time": {$gte: req.body.start, $lte: req.body.end},
      $and: [{"day": {$lte: 5}}, {
        "hour": {
          $gte: req.body.weektime[0],
          $lte: req.body.weektime[1]
        }
      }]

    }
    ;
  } else if (req.body.weekend && !req.body.week) {
    query = {
      "user": req.body.fitbitId,
      "time": {$gte: req.body.start, $lte: req.body.end}, $and: [{"day": {$gt: 5}}, {
        "hour": {
          $gte: req.body.weekendtime[0],
          $lte: req.body.weekendtime[1]
        }
      }]

    };
  } else {
    query = {
      "user": req.body.fitbitId,
      "time": {$gte: req.body.start, $lte: req.body.end}, $or: [
        {
          $and: [{"day": {$lte: 5}}, {
            "hour": {
              $gte: req.body.weektime[0],
              $lte: req.body.weektime[1]
            }
          }]
        },
        {
          $and: [{"day": {$gt: 5}}, {
            "hour": {
              $gte: req.body.weekendtime[0],
              $lte: req.body.weekendtime[1]
            }
          }]
        }]
    };
  }
  var log = {};
  log.user = req.user._id;
  log.req = req.body;
  Log.create(log)
    .then(log => console.log(log))
    .catch(err => console.log(err));
  return Heart.find(query, '-day -hour').sort({time: 1}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}
