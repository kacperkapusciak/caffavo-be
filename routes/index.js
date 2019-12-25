const users = require('./users');

module.exports = app => {
  app.use('/users', users);
};
