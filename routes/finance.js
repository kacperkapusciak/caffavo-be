const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

/**
 *  Przeznaczenie: Zwraca wszystkie transakcje
 *  Metoda: GET
 *  URL: 'finance/'
 *
 *  Struktura odpowiedzi:
 *  [
 *    {
 *       id: Integer
 *       createdAt: Timestamp
 *       value: Float
 *       title: String
 *       orderId: Integer | null
 *    },
 *    { ... }
 *  ]
 *
 *  Przykładowa odpowiedź:
 *  [
 *    {
 *      "id": 13,
 *      "createdAt": "2020-01-15T21:25:48.768Z",
 *      "value": -986.10,
 *      "title": "Kupno skladnika: syrop klonowy",
 *      "orderId": null
 *    },
 *    { ... }
 *  ]
 * */
router.get('/', async (req, res) => {
  const { rows } = await db.query(sql`
    SELECT * FROM transakcje
  `);

  const mappedRows = rows.map(row => ({
    id: row.id,
    createdAt: row.wykonana_o,
    value: parseFloat(row.wartosc),
    title: row.tytul,
    orderId: row.zamowienie_id,
  }));

  res.status(200).send(mappedRows);
});

/**
 *  Przeznaczenie: Zwraca wszystkie transakcje użytkownika o podanym id
 *  Metoda: GET
 *  URL: 'finance/user/:id'
 *  Parametr: [id] - id użytkownika
 *
 *  Struktura odpowiedzi:
 *  [
 *    {
 *       id: Integer
 *       createdAt: Timestamp
 *       value: Float
 *       title: String
 *       orderId: Integer | null
 *    },
 *    { ... }
 *  ]
 *
 *  Przykładowa odpowiedź:
 *  [
 *    {
 *      "id": 17,
 *      "createdAt": "2020-01-16T18:06:51.723Z",
 *      "value": 35.37,
 *      "title": "Oplata zamowienia: 6",
 *      "orderId": 6
 *    }
 *  ]
 * */
router.get('/user/:id', async (req, res) => {
  const { rows } = await db.query(sql`
    SELECT
      t.id, t.wykonana_o, t.wartosc, t.tytul, t.zamowienie_id
    FROM transakcje t
    INNER JOIN zamowienia z
    ON t.zamowienie_id = z.id
    WHERE z.uzytkownik_id=${req.params.id}
  `);

  const mappedRows = rows.map(row => ({
    id: row.id,
    createdAt: row.wykonana_o,
    value: parseFloat(row.wartosc),
    title: row.tytul,
    orderId: row.zamowienie_id,
  }));

  res.status(200).send(mappedRows);
});

/**
 *  Przeznaczenie: Zwraca informacje o stanie konta bankowego firmy
 *  Metoda: GET
 *  URL: 'finance/bankdetails'
 *
 *  Struktura odpowiedzi:
 *  {
 *     numberOfTransactions: Integer
 *     balance: Float
 *     numberOfIncomes: Integer
 *     numberOfOutcomes: Integer
 *  }
 *
 *  Przykładowa odpowiedź:
 *  {
 *     "numberOfTransactions": 17,
 *     "balance": 25459.06,
 *     "numberOfIncomes": 3,
 *     "numberOfOutcomes": 14
 *  }
 * */
router.get('/bankdetails', async (req, res) => {
  const { rows } = await db.query(sql`
    SELECT * FROM konto_bankowe
  `);

  const mappedRow = {
    numberOfTransactions: parseInt(rows[0].ilosc_transakcji),
    balance: parseFloat(rows[0].stan_konta),
    numberOfIncomes: parseInt(rows[0].ilosc_wplywow),
    numberOfOutcomes: parseInt(rows[0].ilosc_wyplywow),
  };

  res.status(200).send(mappedRow);
});

module.exports = router;
