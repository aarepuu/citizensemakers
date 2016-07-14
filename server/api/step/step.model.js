'use strict';

import mongoose from 'mongoose';

var StepSchema = new mongoose.Schema({
  user: String,
  time: Number,
  value: Number
});

export default mongoose.model('Step', StepSchema);
