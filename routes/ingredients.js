const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

router.get('/', async (req, res) => {
  const { rows } = await db.query(sql`SELECT * FROM skladniki`);

  const mappedRows = rows.map(row => ({
    id: row.id,
    name: row.nazwa,
    amount: row.ilosc,
    unit: row.jednostka,
    price: row.cena,
    status: row.status
  }));

  res.status(200).send(mappedRows);
});

module.exports = router;
