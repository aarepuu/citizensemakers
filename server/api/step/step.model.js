'use strict';

import mongoose from 'mongoose';

var StepSchema = new mongoose.Schema({
  user: String,
  time: Number,
  day: Number,
  hour: Number,
  value: Number
});

export default mongoose.model('Step', StepSchema);
