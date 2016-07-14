'use strict';

import mongoose from 'mongoose';

var HeartSchema = new mongoose.Schema({
  user: String,
  time: Number,
  day: Number,
  Hour: Number,
  value: Number
});

export default mongoose.model('Heartrate', HeartSchema);
