const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM uzytkownik');
  res.status(200).send(rows);
});

router.post('/', async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  if (!email && !password) return res.status(400).send();

  if (!firstName && !lastName && !phone) {
    await db.query(sql`
      INSERT INTO uzytkownik (email, haslo) 
      VALUES (${email}, ${password})`);
  } else {
    await db.query(sql`
      INSERT INTO uzytkownik (email, haslo, imie, nazwisko, telefon) 
      VALUES (${email}, ${password}, ${firstName}, ${lastName}, ${phone})`);
  }

  res.status(200).send();
});

module.exports = router;
