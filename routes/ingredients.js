const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

router.get('/', async (req, res) => {
  const { rows } = await db.query(sql`SELECT * FROM skladniki`);
  res.status(200).send(rows);
});

module.exports = router;
