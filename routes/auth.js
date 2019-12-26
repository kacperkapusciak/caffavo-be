const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

router.post('/', async (req, res) => {
  let {email, password} = req.body;

  const {rows} = await db.query(sql`
    SELECT id, email, admin 
    FROM uzytkownik 
    WHERE email=${email} AND haslo=${password};
   `);

  if (!rows.length) return res.status(400).send('Błędny email lub hasło.');

  res.status(200).send(rows[0]);
});

module.exports = router;
