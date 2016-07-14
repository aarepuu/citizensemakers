'use strict';

import mongoose from 'mongoose';

var DataSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});
//TODO - change user to fitbitID and make link to users table
var HeartSchema = new mongoose.Schema({
  user: String,
  time: Number,
  value: Number
});


export default mongoose.model('heartrate', HeartSchema);
