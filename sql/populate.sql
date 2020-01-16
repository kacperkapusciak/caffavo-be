-- kapitał zakładowy

DELETE FROM transakcje;

INSERT INTO transakcje (wartosc, tytul)
VALUES (50000, 'Kapitał zakładowy');

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

INSERT INTO wyroby_cukiernicze (nazwa, porcja, ilosc, jednostka, cena, marza)
VALUES ('ciasteczka korzenne', 1, 2000, 'sztuka', 0.5, 0.2);

INSERT INTO wyroby_cukiernicze (nazwa, porcja, ilosc, jednostka, cena, marza)
VALUES ('ciasteczka imbirowe', 1, 150, 'sztuka', 0.6, 0.25);

INSERT INTO wyroby_cukiernicze (nazwa, porcja, ilosc, jednostka, cena, marza)
VALUES ('sernik', 0.15, 200, 'kilogram', 20, 3);

INSERT INTO wyroby_cukiernicze (nazwa, porcja, ilosc, jednostka, cena, marza)
VALUES ('murzynek', 0.15, 49, 'kilogram', 18, 4);

INSERT INTO wyroby_cukiernicze (nazwa, porcja, ilosc, jednostka, cena, marza)
VALUES ('szarlotka', 0.15, 30, 'kilogram', 23, 2);

INSERT INTO wyroby_cukiernicze (nazwa, porcja, ilosc, jednostka, cena, marza)
VALUES ('pychotka', 0.15, 0, 'kilogram', 27, 4);

DELETE FROM skladniki;

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena)
VALUES ('lavazza qualita oro', 125.25, 'kilogram', 50.98);

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena)
VALUES ('kimbo aroma gold', 54.50, 'kilogram', 71.60);

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena)
VALUES ('dallmayr crema doro', 25, 'kilogram', 38.70);

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena)
VALUES ('mleko krowie pełne', 200, 'litr', 2.30);

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena)
VALUES ('mleko sojowe', 0, 'litr', 5.15);

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena)
VALUES ('mleko owcze', 4, 'litr', 14.99);

INSERT INTO skladniki (nazwa, ilosc, jednostka, cena)
VALUES ('cukier', 2000, 'kostka', 0.10);

DELETE FROM rodzaje_kawy;

INSERT INTO rodzaje_kawy (nazwa, marza)
VALUES ('espresso', 3);

INSERT INTO rodzaje_kawy (nazwa, marza)
VALUES ('cappucino', 2.50);

INSERT INTO rodzaje_kawy (nazwa, marza)
VALUES ('latte z sojowym mlekiem', 2.50);

INSERT INTO rodzaje_kawy (nazwa, marza)
VALUES ('americano kokosowe', 4.20);

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

-- zamowienie kawy

DELETE FROM zamowienia;

INSERT INTO zamowienia (uzytkownik_id, koszt)
VALUES (1, 111);

INSERT INTO zamowiony_produkt (zamowienie_id, ilosc)
VALUES (1, 2);

INSERT INTO zamowiona_kawa (zamowiony_produkt_id, rodzaj_kawy_id)
VALUES (1, 1);

INSERT INTO zamowiony_produkt (zamowienie_id, ilosc)
VALUES (1, 3);

INSERT INTO zamowiony_wyrob_cukierniczy (zamowiony_produkt_id, wyrob_cukierniczy_id)
VALUES (2, 4);

INSERT INTO zamowiony_produkt (zamowienie_id, ilosc)
VALUES (1, 1);

INSERT INTO zamowiony_wyrob_cukierniczy (zamowiony_produkt_id, wyrob_cukierniczy_id)
VALUES (3, 1);
