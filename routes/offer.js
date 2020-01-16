const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

/**
 *  Przeznaczenie: Zwraca całą dostępną ofertę
 *  Metoda: GET
 *  URL: 'offer/'
 *
 *  Struktura odpowiedzi:
 *  [
 *    {
 *      coffeeTypeId: Integer | bakeryId: Integer
 *      name: String
 *      price: Float
 *    },
 *    { ... }
 *  ]
 *
 *  Przykładowa odpowiedź:
 *  [
 *    {
 *      "coffeeTypeId": 1,
 *      "name": "espresso",
 *      "price": "6.57"
 *    },
 *    {
 *      "bakeryId": 1,
 *      "name": "ciasteczka korzenne",
 *      "price": "0.70"
 *    },
 *    { ... }
 *  ]
 * */
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

  const offer = [...mappedCoffeeRows, ...mappedBakeryRows];

  res.status(200).send(offer);
});

module.exports = router;