var express = require('express');
const { pool } = require('../config');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  pool.query('SELECT * FROM books', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
});

module.exports = router;
