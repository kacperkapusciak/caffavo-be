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

  if (!email && !password) return res.status(400).send('Niepoprawne dane.');

  const { rows } = await db.query(sql`
    SELECT email FROM uzytkownik WHERE email=${email}
  `);
  if (rows) return res.status(409).send('Konto z podanym adresem e-mail już istnieje.');

  try {
    if (!firstName && !lastName && !phone) {
      await db.query(sql`
        INSERT INTO uzytkownik (email, haslo) 
        VALUES (${email}, ${password})`);
    } else {
      await db.query(sql`
        INSERT INTO uzytkownik (email, haslo, imie, nazwisko, telefon) 
        VALUES (${email}, ${password}, ${firstName}, ${lastName}, ${phone})`);
    }
  } catch (err) {
    if (err.code === 23505)
      return res.status(409).send('Konto z podanym adresem e-mail już istnieje.');
  }

  res.status(200).send();
});

module.exports = router;
