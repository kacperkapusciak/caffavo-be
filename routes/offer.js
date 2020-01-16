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

/**
 *  Przeznaczenie: Zwraca id najczęściej zamawianej kawy,
 *                 przy podaniu odpowiedniego query string - id najczęściej
 *                 zamawianej kawy przez danego użytkownika
 *  Metoda: GET
 *  URL: 'offer/favouritecoffee' | 'offer/favouritecoffee?user=:id'
 *  Parametr: [id] - id użytkownika
 *
 *  Struktura odpowiedzi:
 *  {
 *    coffeeTypeId: Integer
 *    name: String
 *    price: Float
 *    timesOrdered: Integer
 *  }
 *
 *  Przykładowa odpowiedź:
 *  {
 *    "coffeeTypeId": 2,
 *    "name": "cappucino",
 *    "price": 7.79,
 *    "timesOrdered": 25
 *  }
 * */
router.get('/favouritecoffee', async (req, res) => {
  let query;

  if (!req.query.user) {
    query = sql`
      SELECT uk.rodzaj_kawy_id, nazwa, cena, SUM(ile_razy_zamowiona) as ile_razy_zamowiona 
      FROM ulubiona_kawa uk
      INNER JOIN oferta_kaw ok
      ON uk.rodzaj_kawy_id = ok.rodzaj_kawy_id
      GROUP BY uk.rodzaj_kawy_id, nazwa, cena
      ORDER BY ile_razy_zamowiona DESC
      LIMIT 1;
  `;
  } else {
    query = sql`
      SELECT uk.rodzaj_kawy_id, nazwa, cena, ile_razy_zamowiona 
      FROM ulubiona_kawa uk
      INNER JOIN oferta_kaw ok
      ON uk.rodzaj_kawy_id = ok.rodzaj_kawy_id
      WHERE uzytkownik_id=${req.query.user}
      ORDER BY ile_razy_zamowiona DESC
      LIMIT 1
    `;
  }

  const { rows } = await db.query(query);

  const mappedRow = {
    coffeeTypeId: rows[0].rodzaj_kawy_id,
    name: rows[0].nazwa,
    price: parseFloat(rows[0].cena),
    timesOrdered: parseInt(rows[0].ile_razy_zamowiona)
  };

  res.status(200).send(mappedRow);
});

module.exports = router;