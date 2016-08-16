/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {

  // Insert routes below
  //app.use('/api/logs', require('./api/log'));
  app.use('/api/comments', require('./api/comment'));
  app.use('/api/data/hearts', require('./api/heart'));
  app.use('/api/data/steps', require('./api/step'));
  app.use('/api/data/sleeps', require('./api/sleep'));
  app.use('/api/token', require('./api/token'));
  //app.use('/api/data', require('./api/data'));
  //app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  //app.use('/auth/fitbit', require('./auth/fitbit'));
  app.use('/auth', require('./auth').default);


  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
