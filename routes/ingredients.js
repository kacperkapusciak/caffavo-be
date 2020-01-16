const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

/**
 *  Przeznaczenie: Zwraca wszystkie składniki
 *  Metoda: GET
 *  URL: 'ingredients/'
 *
 *  Struktura odpowiedzi:
 *  [
 *    {
 *      id: Integer
 *      name: String
 *      amount: Float
 *      unit: kilogram' | 'litr' | 'sztuka' | 'kostka'
 *      price: Float
 *      status: 'niedostepny' | 'niska_dostepnosc' | 'dostepny'
 *    },
 *    { ... }
 *  ]
 *
 *  Przykładowa odpowiedź:
 *  [
 *    {
 *      "id": 1,
 *      "name": "lavazza qualita oro",
 *      "amount": 125.25,
 *      "unit": "kilogram",
 *      "price": 50.98,
 *      "status": "dostepny"
 *    },
 *    { ... }
 *  ]
 * */
router.get('/', async (req, res) => {
  const { rows } = await db.query(sql`
    SELECT * FROM skladniki ORDER BY jednostka ASC, ilosc DESC
  `);

  const mappedRows = rows.map(row => ({
    id: row.id,
    name: row.nazwa,
    amount: parseFloat(row.ilosc),
    unit: row.jednostka,
    price: parseFloat(row.cena),
    status: row.status
  }));

  res.status(200).send(mappedRows);
});

/**
 *  Przeznaczenie: Dodawanie składnika
 *  Metoda: POST
 *  URL: 'ingredients/'
 *
 *  Struktura zapytania:
 *  {
 *    name: String
 *    amount: Float
 *    unit: 'kilogram' | 'litr' | 'sztuka' | 'kostka'
 *    price: Float
 *  }
 *
 *  Przykładowe ciało zapytania:
 *  {
 *  	"name": "syrop klonowy",
 *  	"amount": 10.0,
 *  	"unit": "litr",
 *  	"price": 98.61
 *  }
 * */
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

/**
 *  Przeznaczenie: Edycja składnika
 *  Metoda: PUT
 *  URL: 'ingredients/:id'
 *  Parametr: [id] - id składnika
 *
 *  Struktura zapytania:
 *  {
 *    name: String
 *    amount: Float
 *    unit: 'kilogram' | 'litr' | 'sztuka' | 'kostka'
 *    price: Float
 *  }
 *
 *  Przykładowe ciało zapytania:
 *  {
 *  	"name": "lepszy syrop klonowy",
 *  	"amount": 20.0,
 *  	"unit": "litr",
 *  	"price": 198.61
 *  }
 * */
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

/**
 *  Przeznaczenie: Usunięcie składnika
 *  Metoda: DELETE
 *  URL: 'ingredients/:id'
 *  Parametr: [id] - id składnika
 * */
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
