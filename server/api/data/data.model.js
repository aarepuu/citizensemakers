'use strict';

import mongoose from 'mongoose';

var DataSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});
var restHrSchema = new mongoose.Schema({
  userId: Number,
  fitbitId: String,
  studyWeek: Number,
  treatment: String,
  day: Number,
  restHr: Number,
  pos: Number,
  neg: Number
});


export default mongoose.model('Data', restHrSchema);
