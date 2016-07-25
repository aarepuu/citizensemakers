'use strict';

import mongoose from 'mongoose';

var SleepSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('Sleep', SleepSchema);
