const users = require('./users');
const auth = require('./auth');
const ingredients = require('./ingredients');
const offer = require('./offer');
const orders = require('./orders');
const finance = require('./finance');
const bakery = require('./bakery');

module.exports = app => {
  app.use('/users', users);
  app.use('/auth', auth);
  app.use('/ingredients', ingredients);
  app.use('/offer', offer);
  app.use('/orders', orders);
  app.use('/finance', finance);
  app.use('/bakery', bakery);
};
