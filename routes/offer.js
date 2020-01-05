const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

/** Zwraca całą dostępną ofertę */
router.get('/', async (req, res) => {
  const { rows: coffeeRows } = await db.query(sql`SELECT * FROM oferta_kaw`);
  const { rows: bakeryRows } = await db.query(sql`SELECT * FROM oferta_wyrobow_cukierniczych`);

  const mappedCoffeeRows = coffeeRows.map(row => ({
    coffeeTypeId: row.rodzaj_kawy_id,
    name: row.nazwa,
    price: row.cena
  }));

  const mappedBakeryRows = bakeryRows.map(row => ({
    bakeryId: row.wyrob_cukierniczy_id,
    name: row.nazwa,
    price: row.cena
  }));

  const offer = {
    coffeeTypes: mappedCoffeeRows,
    bakery: mappedBakeryRows
  };

  res.status(200).send(offer);
});

module.exports = router;