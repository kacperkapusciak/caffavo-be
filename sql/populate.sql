DELETE FROM uzytkownik;

INSERT INTO uzytkownik (email, haslo, admin)
VALUES ('admin@caffavo.com', 'password', true);

INSERT INTO uzytkownik (email, haslo)
VALUES ('user@caffavo.com', 'qwertyuiop');

INSERT INTO uzytkownik (email, haslo)
VALUES ('user-2@caffavo.com', '1234567890');

DELETE FROM adres;

INSERT INTO adres (ulica, nr_budynku, nr_lokalu, kod_pocztowy, miasto)
VALUES ('Pawia', '7', '3', '00-000', 'Warszawa');

INSERT INTO adres (ulica, nr_budynku, kod_pocztowy, miasto)
VALUES ('Krucza', '2', '00-001', 'Kraków');

INSERT INTO adres (ulica, nr_budynku, nr_lokalu, kod_pocztowy, miasto)
VALUES ('Gołębia', '12', '24', '21-037', 'Poznań');

INSERT INTO adres (ulica, nr_budynku, nr_lokalu, kod_pocztowy, miasto)
VALUES ('Jastrzębia', '420', '69', '22-000', 'Warszawa');

INSERT INTO adres (ulica, nr_budynku, nr_lokalu, kod_pocztowy, miasto)
VALUES ('Bociania', '1a', '3', '00-000', 'Warszawa');

UPDATE uzytkownik
SET adres_id=1, imie='Jan', nazwisko='Kowalski', telefon='+48555666777'
WHERE email='user@caffavo.com';

UPDATE uzytkownik
SET adres_id=2, imie='Andrzej', nazwisko='Nowak', telefon='+48999888777'
WHERE email='user-2@caffavo.com';

DELETE FROM wyroby_cukiernicze;

INSERT INTO wyroby_cukiernicze (nazwa, ilosc, jednostka, cena, marza)
VALUES ('ciasteczka korzenne', 100, 'sztuka', 0.5, 0.2);

INSERT INTO wyroby_cukiernicze (nazwa, ilosc, jednostka, cena, marza)
VALUES ('sernik', 20, 'kilogram', 20, 3);

INSERT INTO wyroby_cukiernicze (nazwa, ilosc, jednostka, cena, marza)
VALUES ('murzynek', 14, 'kilogram', 18, 4);

INSERT INTO wyroby_cukiernicze (nazwa, ilosc, jednostka, cena, marza)
VALUES ('szarlotka', 30, 'kilogram', 23, 2);

DELETE FROM skladniki;

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena, status)
VALUES ('lavazza qualita oro', 125.25, 'kilogram', 50.98, 'dostepny');

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena, status)
VALUES ('kimbo aroma gold', 54.50, 'kilogram', 71.60, 'dostepny');

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena, status)
VALUES ('dallmayr crema doro', 25, 'kilogram', 38.70, 'dostepny');

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena, status)
VALUES ('mleko krowie pełne', 200, 'litr', 2.30, 'dostepny');

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena, status)
VALUES ('mleko sojowe', 0, 'litr', 5.15, 'niedostepny');

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena, status)
VALUES ('mleko owcze', 4, 'litr', 14.99, 'niska_dostepnosc');

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena, status)
VALUES ('cukier', 2000, 'kostka', 0.10, 'dostepny');

DELETE FROM rodzaje_kawy;

INSERT INTO rodzaje_kawy (nazwa, marza)
VALUES ('espresso', 3);

INSERT INTO rodzaje_kawy (nazwa, marza)
VALUES ('cappucino', 2.50);

INSERT INTO rodzaje_kawy (nazwa, marza)
VALUES ('latte z sojowym mlekiem', 2.50);

-- aktualizacja ceny kawy po ilości i cenie skladnikow

CREATE OR REPLACE FUNCTION zaaktualizuj_cene_kawy() RETURNS TRIGGER AS $emp_audit$
    BEGIN
        UPDATE rodzaje_kawy
        SET cena_skladnikow = sub.cena_skladnikow
        FROM (
            SELECT
                r.id AS id, ROUND(SUM(p.ilosc * s.cena), 2) AS cena_skladnikow
            FROM przepisy p
            JOIN skladniki s ON p.skladnik_id = s.id
            JOIN rodzaje_kawy r ON p.rodzaj_kawy_id = r.id
            GROUP BY r.id
            ORDER BY r.id ASC
        ) as sub
        WHERE rodzaje_kawy.id = sub.id;
        RETURN NULL;
    END;
$emp_audit$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS aktualizuj_cene_kawy ON przepisy;

CREATE TRIGGER aktualizuj_cene_kawy
AFTER INSERT OR UPDATE OR DELETE ON przepisy
FOR EACH ROW EXECUTE PROCEDURE zaaktualizuj_cene_kawy();

DELETE FROM przepisy;
-- espresso
INSERT INTO przepisy (rodzaj_kawy_id, skladnik_id, ilosc)
VALUES (1, 1, 0.07);

-- cappucino
INSERT INTO przepisy (rodzaj_kawy_id, skladnik_id, ilosc)
VALUES (2, 2, 0.07);
INSERT INTO przepisy (rodzaj_kawy_id, skladnik_id, ilosc)
VALUES (2, 4, 0.12);

-- latte z sojowym mlekiem
INSERT INTO przepisy (rodzaj_kawy_id, skladnik_id, ilosc)
VALUES (3, 2, 0.14);
INSERT INTO przepisy (rodzaj_kawy_id, skladnik_id, ilosc)
VALUES (3, 5, 0.25);
