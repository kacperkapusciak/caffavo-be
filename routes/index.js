const users = require('./users');
const auth = require('./auth');
const ingredients = require('./ingredients');
const offer = require('./offer');

module.exports = app => {
  app.use('/users', users);
  app.use('/auth', auth);
  app.use('/ingredients', ingredients);
  app.use('/offer', offer);
};
