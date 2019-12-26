const users = require('./users');
const auth = require('./auth');

module.exports = app => {
  app.use('/users', users);
  app.use('/auth', auth);
};
