const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

router.get('/', async (req, res) => {
  const { rows } = await db.query(sql`
    SELECT * FROM zamowienia;
  `);
  return res.status(200).send(rows);
});

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
    amount: item.ilosc,
    price: item.cena,
    sugar: item.ilosc_cukru,
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
    price: order.rows[0].koszt,
    deliveryCost: order.rows[0].koszt_dostawy,
    payed: order.rows[0].oplacone,
    orderedItems: mappedOrderedItems
  };

  return res.status(200).send(data);
});

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

module.exports = router;
