'use strict';

import mongoose from 'mongoose';

var LogSchema = new mongoose.Schema({
  user: String,
  time: { type: Date, default: Date.now },
  req: {}
});

export default mongoose.model('Log', LogSchema);
