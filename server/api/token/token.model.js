'use strict';

import mongoose from 'mongoose';

var TokenSchema = new mongoose.Schema({
  access_token: String,
  expires_in: Number,
  refresh_token: String,
  //TODO - convert to array ??
  scope: String,
  token_type: String,
  user_id: String,
  expires_at: String
});

export default mongoose.model('Token', TokenSchema);
