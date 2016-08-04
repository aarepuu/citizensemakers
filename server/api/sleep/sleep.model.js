'use strict';

import mongoose from 'mongoose';

var SleepSchema = new mongoose.Schema({
  user: String,
  time: Number,
  day: Number,
  hour: Number,
  value: Number,
  logId: Number,
});

export default mongoose.model('Sleep', SleepSchema);
