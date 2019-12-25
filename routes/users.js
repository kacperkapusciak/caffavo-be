const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM uzytkownik');
  res.status(200).send(rows);
});

router.post('/', async (req, res) => {
  let { email, password } = req.body;

  await db.query(sql`
    INSERT INTO uzytkownik (email, haslo) 
    VALUES (${email}, ${password})`);
  res.status(200).send();
});

module.exports = router;
