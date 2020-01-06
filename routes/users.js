const sql = require('sql-template-strings');
const Router = require('express-promise-router');

const db = require('../db');

const router = new Router();

/** Zwraca wszystkich uzytkownikow */
router.get('/', async (req, res) => {
  const { rows } = await db.query(sql`SELECT * FROM uzytkownik`);
  res.status(200).send(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await db.query(sql`
    SELECT * FROM pelne_dane_uzytkownika
    WHERE id=${req.params.id}
  `);

  if (!rows.length) return res.status(404).send('Nie znaleziono.');

  const row = rows[0];

  const mappedRow = {
    email: row.email,
    registeredAt: row.zarejestrowany_o,
    firstName: row.imie,
    lastName: row.nazwisko,
    phone: row.telefon,
    street: row.ulica,
    building: row.nr_budynku,
    apartment: row.nr_lokalu,
    postal: row.kod_pocztowy,
    city: row.miasto
  };

  res.status(200).send(mappedRow);
});

/** Rejestracja użytkownika */
router.post('/', async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  if (!email && !password) return res.status(400).send('Niepoprawne dane.');

  try {
    if (!firstName && !lastName && !phone) {
      await db.query(sql`
        INSERT INTO uzytkownik (email, haslo) 
        VALUES (${email}, ${password})`);
    } else {
      await db.query(sql`
        INSERT INTO uzytkownik (email, haslo, imie, nazwisko, telefon) 
        VALUES (${email}, ${password}, ${firstName}, ${lastName}, ${phone})`);
    }
  } catch (err) {
    return res.status(409).send('Konto z podanym adresem e-mail już istnieje.');
  }

  res.status(200).send();
});

router.put('/:id', async (req, res) => {
  const { firstName, lastName, phone, street, building, apartment, postal, city } = req.body;

  const { rows } = await db.query(sql`
    UPDATE uzytkownik
    SET imie=${firstName}, nazwisko=${lastName}, telefon=${phone}
    WHERE id=${req.params.id}
    RETURNING adres_id
  `);

  if (rows[0].adres_id) {
    await db.query(sql`
      UPDATE adres
      SET ulica=${street}, nr_budynku=${building},
      nr_lokalu=${apartment}, kod_pocztowy=${postal},
      miasto=${city}
      WHERE id=${rows[0].adres_id}
    `);
  } else {
    const { rows } = await db.query(sql`
      INSERT INTO adres (ulica, nr_budynku, nr_lokalu, kod_pocztowy, miasto)
      VALUES (${street}, ${building}, ${apartment}, ${postal}, ${city})
      RETURNING id
    `);
    const { id } = rows[0];
    await db.query(sql`
      UPDATE uzytkownik
      SET adres_id=${id}
      WHERE id=${req.params.id}
    `);
  }

  return res.status(200).send();
});

module.exports = router;
