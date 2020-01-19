const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

/**
 *  Przeznaczenie: Zwraca wszystkie kawy wraz z przepisami
 *  Metoda: GET
 *  URL: 'coffee/'
 *
 *  Struktura odpowiedzi:
 *  [
 *    {
 *      id: Integer
 *      name: String
 *      productionCost: Integer
 *      priceMargin: Float
 *      status: 'niedostepny' | 'niska_dostepnosc' | 'dostepny'
 *      recipe: [
 *        {
 *          coffeeTypeId: Integer
 *          ingredientId: Integer
 *          name: String
 *          amount: Integer
 *          unit: String
 *        },
 *        { ... }
 *      ]
 *    },
 *    { ... }
 *  ]
 *
 *  Przykładowa odpowiedź:
 *  [
 *    {
 *      "id": 2,
 *      "name": "cappucino",
 *      "productionCost": "5.29",
 *      "priceMargin": "2.50",
 *      "status": "dostepny",
 *      "recipe": [
 *        {
 *          "coffeeTypeId": 2,
 *          "ingredientId": 2,
 *          "name": "kimbo aroma gold",
 *          "amount": 0.07,
 *          "unit": "kilogram"
 *        },
 *        { ... }
 *      ]
 *    },
 *    { ... }
 *  ]
 * */
router.get('/', async (req, res) => {
  const { rows: coffeeType } = await db.query(sql`
    SELECT * FROM rodzaje_kawy
  `);

  const mappedCoffeeType = coffeeType.map(coffee => ({
    id: coffee.id,
    name: coffee.nazwa,
    productionCost: parseFloat(coffee.cena_skladnikow),
    priceMargin: parseFloat(coffee.marza),
    status: coffee.status,
    recipe: []
  }));

  const { rows: recipes } = await db.query(sql`
    SELECT rodzaj_kawy_id, skladnik_id, p.ilosc, nazwa, jednostka
    FROM przepisy p
    JOIN skladniki s
    ON p.skladnik_id = s.id
  `);

  const mappedRecipes = recipes.map(recipe => ({
    coffeeTypeId: recipe.rodzaj_kawy_id,
    ingredientId: recipe.skladnik_id,
    name: recipe.nazwa,
    amount: parseFloat(recipe.ilosc),
    unit: recipe.jednostka
  }));

  mappedCoffeeType.forEach(coffee => {
    mappedRecipes.forEach(item => {
      if (item.coffeeTypeId === coffee.id)
        coffee.recipe.push(item)
    })
  });

  return res.status(200).send(mappedCoffeeType);
});

/**
 *  Przeznaczenie: Dodawanie nowego rodzaju kawy wraz z przepisem
 *  Metoda: POST
 *  URL: 'orders/'
 *
 *  Struktura zapytania:
 *  {
 *    name: String
 *    priceMargin: Float
 *    recipe: [
 *      {
 *        id: Integer
 *        amount: Float
 *      },
 *      { ... }
 *    ]
 *  }
 *  Przykładowe zapytanie:
 *  {
 *    "name": "flat white",
 *    priceMargin: 2.15
 *    "recipe": [
 *      {
 *        "id": 1,
 *        "amount": 0.09
 *      },
 *      {
 *        "id": 4,
 *        "amount": 0.12
 *      }
 *    ]
 *  }
 * */
router.post('/', async (req, res) => {
  const { name, recipe, priceMargin } = req.body;

  if (!name || !Array.isArray(recipe)) return res.status(400).send();

  const { rows } = await db.query(sql`
    INSERT INTO rodzaje_kawy (nazwa, marza)
    VALUES (${name}, ${priceMargin})
    RETURNING id
  `);
  const { id: coffeeId } = rows[0];

  const promises = recipe.map(item => (
    db.query(sql`
      INSERT INTO przepisy (rodzaj_kawy_id, skladnik_id, ilosc)
      VALUES (${coffeeId}, ${item.id}, ${item.amount})
    `)
  ));

  await Promise.all(promises);

  return res.status(200).send();
});

/**
 *  Przeznaczenie: Usunięcie kawy wraz z przepisem
 *  Metoda: DELETE
 *  URL: 'ingredients/:id'
 *  Parametr: [id] - id składnika
 * */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  await db.query(sql`
    DELETE FROM przepisy
    WHERE rodzaj_kawy_id=${id}
  `);

  await db.query(sql`
    DELETE FROM rodzaje_kawy
    WHERE id=${id}
  `);

  return res.status(200).send();
});

module.exports = router;