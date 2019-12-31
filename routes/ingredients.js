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


router.post('/', async (req, res) => {
  const { name, amount, unit, price } = req.body;

  if (!name && !amount && !unit && !price) return res.status(400).send();

  try {
    await db.query(sql`
      INSERT INTO skladniki (nazwa, ilosc, jednostka, cena)
      VALUES (${name}, ${amount}, ${unit}, ${price})`);
  } catch (err) {
    return res.status(400).send(err);
  }

  res.status(200).send();
});

router.put('/:id', async (req, res) => {
  const { name, amount, unit, price } = req.body;

  if (!name && !amount && !unit && !price) return res.status(400).send();

  try {
    await db.query(sql`
      UPDATE skladniki
      SET nazwa=${name}, ilosc=${amount}, jednostka=${unit}, cena=${price}
      WHERE id=${req.params.id}`);
  } catch (err) {
    return res.status(400).send(err);
  }

  res.status(200).send();
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query(sql`
      DELETE FROM skladniki
      WHERE id=${req.params.id}`);
  } catch (err) {
    return res.status(400).send(err);
  }

  res.status(200).send();
});

module.exports = router;
