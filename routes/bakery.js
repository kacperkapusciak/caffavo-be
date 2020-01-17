const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

/**
 *  Przeznaczenie: Zwraca wszystkie wyroby cukiernicze
 *  Metoda: GET
 *  URL: 'bakery/'
 *
 *  Struktura odpowiedzi:
 *  [
 *    {
 *      id: Integer
 *      name: String
 *      portion: Float
 *      amount: Float
 *      unit: kilogram' | 'sztuka'
 *      price: Float
 *      priceMargin: Float
 *      status: 'niedostepny' | 'niska_dostepnosc' | 'dostepny'
 *    },
 *    { ... }
 *  ]
 *
 *  Przykładowa odpowiedź:
 *  [
 *    {
 *       "id": 3,
 *       "name": "sernik",
 *       "portion": 0.15,
 *       "amount": 200,
 *       "unit": "kilogram",
 *       "price": 20,
 *       "priceMargin": 3,
 *       "status": "dostepny"
 *    },
 *    { ... }
 *  ]
 * */
router.get('/', async (req, res) => {
  const { rows } = await db.query(sql`
    SELECT * FROM wyroby_cukiernicze ORDER BY jednostka ASC, ilosc DESC
  `);

  const mappedRows = rows.map(row => ({
    id: row.id,
    name: row.nazwa,
    portion: parseFloat(row.porcja),
    amount: parseFloat(row.ilosc),
    unit: row.jednostka,
    price: parseFloat(row.cena),
    priceMargin: parseFloat(row.marza),
    status: row.status
  }));

  res.status(200).send(mappedRows);
});

/**
 *  Przeznaczenie: Dodawanie wyrobu cukierniczego
 *  Metoda: POST
 *  URL: 'bakery/'
 *
 *  Struktura zapytania:
 *  {
 *    name: String
 *    portion: Float
 *    amount: Float
 *    unit: 'kilogram' | 'sztuka'
 *    price: Float
 *    priceMargin: Float | null
 *  }
 *
 *  Przykładowe ciało zapytania:
 *  {
 *  	"name": "pieguski",
 *    "portion": 1,
 *  	"amount": 100.0,
 *  	"unit": "sztuka",
 *  	"price": 1.25,
 *    "priceMargin": 0.25
 *  }
 * */
router.post('/', async (req, res) => {
  const { name, portion, amount, unit, price, priceMargin } = req.body;

  if (!name && !portion && !amount && !unit && !price) return res.status(400).send();

  try {
    await db.query(sql`
      INSERT INTO wyroby_cukiernicze (nazwa, porcja, ilosc, jednostka, cena, marza)
      VALUES (${name}, ${portion}, ${amount}, ${unit}, ${price}, ${priceMargin})
      `);
  } catch (err) {
    return res.status(400).send(err);
  }

  res.status(200).send();
});

/**
 *  Przeznaczenie: Edycja wyrobu cukierniczego
 *  Metoda: PUT
 *  URL: 'bakery/:id'
 *  Parametr: [id] - id składnika
 *
 *  Struktura zapytania:
 *  {
 *    name: String
 *    portion: Float
 *    amount: Float
 *    unit: 'kilogram' | 'sztuka'
 *    price: Float
 *    priceMargin: Float | null
 *  }
 *
 *  Przykładowe ciało zapytania:
 *  {
 *  	"name": "pieguski",
 *    "portion": 1,
 *  	"amount": 100.0,
 *  	"unit": "sztuka",
 *  	"price": 1.25,
 *    "priceMargin": 0.25
 *  }
 * */
router.put('/:id', async (req, res) => {
  const { name, portion, amount, unit, price, priceMargin } = req.body;

  if (!name && !portion && !amount && !unit && !price) return res.status(400).send();

  try {
    await db.query(sql`
      UPDATE wyroby_cukiernicze
      SET
       nazwa=${name}, 
       porcja=${portion}, 
       ilosc=${amount}, 
       jednostka=${unit}, 
       cena=${price}, 
       marza=${priceMargin}
      WHERE id=${req.params.id}
    `);
  } catch (err) {
    return res.status(400).send(err);
  }

  res.status(200).send();
});

/**
 *  Przeznaczenie: Usunięcie wyrobu cukierniczego o podanym id
 *  Metoda: DELETE
 *  URL: 'bakery/:id'
 *  Parametr: [id] - id wyrobu cukierniczego
 * */
router.delete('/:id', async (req, res) => {
  try {
    await db.query(sql`
      DELETE FROM wyroby_cukiernicze
      WHERE id=${req.params.id}`);
  } catch (err) {
    return res.status(400).send(err);
  }

  res.status(200).send();
});

module.exports = router;
