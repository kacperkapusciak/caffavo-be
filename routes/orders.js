const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

/**
 *  Przeznaczenie: Zwraca wszystkie zamowienia
 *  Metoda: GET
 *  URL: 'orders/'
 *
 *  Struktura odpowiedzi:
 *  [
 *    {
 *      id: Integer
 *      userId: Integer
 *      addressId: Integer | null
 *      status: 'zlozone' | 'przyjete_do_realizacji' | 'w_trakcie' | 'zrealizowane' | 'anulowane
 *      createdAt: Timestamp
 *      completedAt: Timestamp | null
 *      price: Float
 *      deliveryCost: Float
 *      payed: Boolean
 *      opinionId: Integer | null
 *    },
 *    { ... }
 *  ]
 *
 *  Przykładowa odpowiedź:
 *  [
 *    {
 *      "id": 1,
 *      "userId": 1,
 *      "addressId": null,
 *      "status": "zlozone",
 *      "createdAt": "2020-01-15T20:23:37.394Z",
 *      "completedAt": null,
 *      "price": "21.37",
 *      "deliveryCost": "5.00",
 *      "payed": false,
 *      "opinionId": null
 *    },
 *    { ... }
 *  ]
 * */
router.get('/', async (req, res) => {
  const { rows } = await db.query(sql`
    SELECT z.id, uzytkownik_id, email, z.adres_id, status, data_zlozenia,
    data_realizacji, koszt, koszt_dostawy, oplacone, opinie_id
    FROM zamowienia z
    JOIN uzytkownik u
    ON z.uzytkownik_id = u.id
    ORDER BY data_zlozenia DESC
  `);

  const mappedRows = rows.map(row => ({
    id: row.id,
    userId: row.uzytkownik_id,
    email: row.email,
    addressId: row.adres_id,
    status: row.status,
    createdAt: row.data_zlozenia,
    completedAt: row.data_realizacji,
    price: parseFloat(row.koszt),
    deliveryCost: parseFloat(row.koszt_dostawy),
    payed: row.oplacone,
    opinionId: row.opinie_id,
  }));

  return res.status(200).send(mappedRows);
});

/**
 *  Przeznaczenie: Zwraca wszystkie zamówienia użytkownika o podanym id
 *  Metoda: GET
 *  URL: 'orders/user/:id'
 *  Parametr: [id] - id użytkownika
 *
 *  Struktura odpowiedzi:
 *  [
 *    {
 *      id: Integer
 *      status: 'zlozone' | 'przyjete_do_realizacji' | 'w_trakcie' | 'zrealizowane' | 'anulowane
 *      createdAt: Timestamp
 *      completedAt: Timestamp | null
 *      price: Float
 *      deliveryCost: Float
 *      payed: Boolean
 *      opinionId: Integer | null
 *    },
 *    { ... }
 *  ]
 *
 *  Przykładowa odpowiedź:
 *  [
 *    {
 *      "id": 1,
 *      "status": "zlozone",
 *      "createdAt": "2020-01-15T20:23:37.394Z",
 *      "completedAt": null,
 *      "price": "21.37",
 *      "deliveryCost": "5.00",
 *      "payed": false,
 *      "opinionId": null
 *    },
 *    { ... }
 *  ]
 * */
router.get('/user/:id', async (req, res) => {
  const { rows } = await db.query(sql`
    SELECT id, status, data_zlozenia, data_realizacji,
    koszt, koszt_dostawy, oplacone, opinie_id FROM zamowienia
    WHERE uzytkownik_id=${req.params.id}
    ORDER BY data_zlozenia DESC
  `);

  const mappedRows = rows.map(row => ({
    id: row.id,
    status: row.status,
    createdAt: row.data_zlozenia,
    completedAt: row.data_realizacji,
    price: parseFloat(row.koszt),
    deliveryCost: parseFloat(row.koszt_dostawy),
    payed: row.oplacone,
    opinionId: row.opinie_id,
  }));

  return res.status(200).send(mappedRows);
});

/**
 *  Przeznaczenie: Zwraca pełne dane o zamówieniu
 *  Metoda: GET
 *  URL: 'orders/:id'
 *  Parametr: [id] - id zamówienia
 *
 *  Struktura odpowiedzi:
 *  {
 *    id: Integer
 *    user: {
 *      id: Integer
 *      email: String
 *      registeredAt: Timestamp
 *      firstName: String | null
 *      lastName: String | null
 *      phone: String | null
 *      street: String | null
 *      building: String | null
 *      apartment: String | null
 *      postal: String | null
 *      city: String | null
 *    },
 *    status: 'zlozone' | 'przyjete_do_realizacji' | 'w_trakcie' | 'zrealizowane' | 'anulowane
 *    createdAt: Timestamp
 *    completedAt: Timestamp | null
 *    price: Float
 *    deliveryCost: Float
 *    payed: Boolean
 *    orderedItems: [
 *      {
 *        id: 2
 *        name: String
 *        amount: Float
 *        price: Float
 *        sugar: Integer | null
 *        type: 'bakery' | 'coffee'
 *      },
 *      { ... }
 *    ]
 *  }
 *
 *  Przykładowa odpowiedź:
 *  {
 *    "id": 1,
 *    "user": {
 *      "id": 1,
 *      "email": "admin@caffavo.com",
 *      "registeredAt": "2020-01-15T19:28:03.140Z",
 *      "firstName": "Admin",
 *      "lastName": "Caffavo",
 *      "phone": "+48694202137",
 *      "street": "Pawia",
 *      "building": "8",
 *      "apartment": null,
 *      "postal": "00-000",
 *      "city": "Warszawa"
 *    },
 *    "status": "zlozone",
 *    "createdAt": "2020-01-15T20:23:37.394Z",
 *    "completedAt": null,
 *    "price": 21.37,
 *    "deliveryCost": 5.00,
 *    "payed": true,
 *    "orderedItems": [
 *      {
 *        "id": 2,
 *        "name": "murzynek",
 *        "amount": 2.00,
 *        "price": 3.30,
 *        "sugar": null,
 *        "type": "bakery"
 *      }
 *    }
 * */
router.get('/:id', async (req, res) => {
  const order = await db.query(sql`
    SELECT * FROM zamowienia
    WHERE id=${req.params.id}
  `);
  if (!order.rows.length) return res.status(404).send();

  const orderedItems = await db.query(sql`
    SELECT * FROM zamowione_produkty
    WHERE zamowienie_id=${req.params.id}
  `);

  const userId = order.rows[0].uzytkownik_id;

  const userInfo = await db.query(sql`
    SELECT * FROM pelne_dane_uzytkownika
    WHERE id=${userId}
  `);

  const mappedOrderedItems = orderedItems.rows.map(item => ({
    id: item.zamowiony_produkt_id,
    name: item.nazwa,
    amount: parseFloat(item.ilosc),
    price: parseFloat(item.cena),
    sugar: parseInt(item.ilosc_cukru),
    type: item.typ
  }));

  const data = {
    id: order.rows[0].id,
    user: {
      id: userInfo.rows[0].id,
      email: userInfo.rows[0].email,
      registeredAt: userInfo.rows[0].zarejestrowany_o,
      firstName: userInfo.rows[0].imie,
      lastName: userInfo.rows[0].nazwisko,
      phone: userInfo.rows[0].telefon,
      street: userInfo.rows[0].ulica,
      building: userInfo.rows[0].nr_budynku,
      apartment: userInfo.rows[0].nr_lokalu,
      postal: userInfo.rows[0].kod_pocztowy,
      city: userInfo.rows[0].miasto
    },
    status: order.rows[0].status,
    createdAt: order.rows[0].data_zlozenia,
    completedAt: order.rows[0].data_realizacji,
    price: parseFloat(order.rows[0].koszt),
    deliveryCost: parseFloat(order.rows[0].koszt_dostawy),
    payed: order.rows[0].oplacone,
    orderedItems: mappedOrderedItems
  };

  return res.status(200).send(data);
});

/**
 *  Przeznaczenie: Dodawanie nowego zamówienia
 *  Metoda: POST
 *  URL: 'orders/'
 *
 *  Struktura zapytania:
 *
 *  {
 *  	userId: 2,
 *  	items: [
 *  	  {
 *  		  coffeeTypeId: Integer | bakeryId: Integer
 *  		  amount: Float
 *  	  },
 *  	  { ... }
 *  	]
 *  }
 *  Przykładowe zapytanie:
 *  {
 *    "userId": 2,
 *    "items": [
 *      {
 *        "coffeeTypeId": 2,
 *        "amount": 3
 *      },
 *      {
 *        "bakeryId": 1,
 *        "amount": 10
 *      }
 *    ]
 *  }
 *
 *  Struktura odpowiedzi:
 *  {
 *    id: Integer
 *  }
 *
 *  Przykładowa odpowiedź:
 *  {
 *    id: 1
 *  }
 * */
router.post('/', async (req, res) => {
  const { userId, items } = req.body;

  const coffeeTypes = items.filter(item => item.coffeeTypeId);
  const bakery = items.filter(item => item.bakeryId);
  let totalCoffeeCost = 0, totalBakeryCost = 0;

  if (coffeeTypes.length) {
    totalCoffeeCost = await coffeeTypes.reduce(async (val, obj) => {
      const { rows } = await db.query(sql`
        SELECT ${obj.amount} * cena as price
        FROM oferta_kaw
        WHERE rodzaj_kawy_id=${obj.coffeeTypeId}
      `);
      return parseFloat(await val) + parseFloat(await rows[0].price);
    }, 0);
  }

  if (bakery.length) {
    totalBakeryCost = bakery.length && await bakery.reduce(async (val, obj) => {
      const { rows } = await db.query(sql`
        SELECT ${obj.amount} * cena as price
        FROM oferta_wyrobow_cukierniczych
        WHERE wyrob_cukierniczy_id=${obj.bakeryId}
      `);
      return parseFloat(await val) + parseFloat(await rows[0].price);
    }, 0);
  }

  const totalOrderCost = totalCoffeeCost + totalBakeryCost;

  const { rows } = await db.query(sql`
    INSERT INTO zamowienia (uzytkownik_id, koszt) 
    VALUES (${userId}, ${totalOrderCost})
    RETURNING id
  `);

  const orderId = rows[0].id;

  coffeeTypes.length && coffeeTypes.forEach(async coffee => {
    const orderedItemResponse = await db.query(sql`
      INSERT INTO zamowiony_produkt (zamowienie_id, ilosc) 
      VALUES (${orderId}, ${coffee.amount})
      RETURNING id
    `);
    const orderedItemId = orderedItemResponse.rows[0].id;
    await db.query(sql`
      INSERT INTO zamowiona_kawa (zamowiony_produkt_id, rodzaj_kawy_id) 
      VALUES (${orderedItemId}, ${coffee.coffeeTypeId})
    `);
  });

  bakery.length && bakery.forEach(async bakeryItem => {
    const orderedItemResponse = await db.query(sql`
      INSERT INTO zamowiony_produkt (zamowienie_id, ilosc) 
      VALUES (${orderId}, ${bakeryItem.amount})
      RETURNING id
    `);
    const orderedItemId = orderedItemResponse.rows[0].id;
    await db.query(sql`
      INSERT INTO zamowiony_wyrob_cukierniczy (zamowiony_produkt_id, wyrob_cukierniczy_id) 
      VALUES (${orderedItemId}, ${bakeryItem.bakeryId})
    `);
  });

  return res.status(200).send({ id: orderId });
});

/**
 *  Przeznaczenie: Opłacenie zamówienia
 *  Metoda: PUT
 *  URL: 'orders/:id/pay'
 *  Parametr: [id] - id zamówienia, które ma zostać opłacone
 * */
router.put('/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { rows } = await db.query(sql`
    UPDATE zamowienia
    SET oplacone='true'
    WHERE id=${id}
    RETURNING koszt, koszt_dostawy
  `);

  if (!rows.length) return res.status(404).send();

  const { koszt, koszt_dostawy } = rows[0];
  const paymentValue = parseFloat(koszt) + parseFloat(koszt_dostawy);
  const paymentTitle = `Oplata zamowienia: #${id}`;

  await db.query(sql`
    INSERT INTO transakcje (wartosc, tytul, zamowienie_id)
    VALUES (${paymentValue}, ${paymentTitle}, ${id})
  `);
  return res.status(200).send();
});

/**
 *  Przeznaczenie: Anulowanie zamówienia
 *  Metoda: PUT
 *  URL: 'orders/:id/cancel'
 *  Parametr: [id] - id zamówienia, które ma zostać anulowane
 * */
router.put('/:id/cancel', async (req, res) => {
  const { id } = req.params;

  const { rows: time } = await db.query(sql`
    SELECT data_zlozenia FROM zamowienia
    WHERE id=${id}
  `);

  const currentDate = new Date().valueOf();
  const isExpired = (currentDate - time[0].data_zlozenia) / (60 * 1000) > 5;

  if (isExpired) return res.status(403).send('Nie można anulować zamówienia starszego niż 5 minut.');

  const { rows: zamowienie } = await db.query(sql`
    UPDATE zamowienia
    SET status='anulowane'
    WHERE id=${id}
    RETURNING oplacone, koszt, koszt_dostawy
  `);

  const { oplacone, koszt, koszt_dostawy } = zamowienie[0];
  if (oplacone === 'true') {
    await db.query(sql`
      INSERT INTO transakcje (wartosc, tytul, zamowienie_id)
      VALUES (${-(koszt + koszt_dostawy)}, "Zwrot kosztów zamówienia: ${id}", ${id})
    `);
  }

  return res.status(200).send();
});

/**
 * Przeznaczenie: Usuwa zamowienia o podanym id
 * Metoda: DELETE
 * URL: 'orders/:id'
 * Parametr: [id] - id zamowienia
 * */
router.delete('/:id', async (req, res) => {
  await db.query(sql`
    DELETE FROM zamowienia
    WHERE id=${req.params.id}
  `);
  return res.status(200).send();
});

module.exports = router;
