-- TYPY

CREATE TYPE "status_zamowienia" AS ENUM (
  'zlozone',
  'przyjete_do_realizacji',
  'w_trakcie',
  'zrealizowane',
  'anulowane'
);

CREATE TYPE "status_produktu" AS ENUM (
  'niedostepny',
  'niska_dostepnosc',
  'dostepny'
);

CREATE TYPE "jednostka_skladnik" AS ENUM (
  'kilogram',
  'litr',
  'sztuka',
  'kostka'
);

CREATE TYPE "jednostka_wyrob_cukierniczy" AS ENUM (
  'kilogram',
  'sztuka'
);

CREATE TYPE "ocena" AS ENUM (
  '1',
  '2',
  '3',
  '4',
  '5'
);

CREATE TYPE "ilosc_cukru" AS ENUM (
  '0',
  '1',
  '2',
  '3'
);

-- TABELE

CREATE TABLE "adres" (
  "id" SERIAL PRIMARY KEY,
  "ulica" varchar NOT NULL,
  "nr_budynku" varchar NOT NULL,
  "nr_lokalu" varchar,
  "kod_pocztowy" varchar NOT NULL,
  "miasto" varchar NOT NULL DEFAULT 'Kraków'
);

CREATE TABLE "uzytkownik" (
  "id" SERIAL PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "haslo" varchar NOT NULL,
  "admin" boolean NOT NULL DEFAULT false, -- dla prostej autoryzacji użytkowników
  "zarejestrowany_o" timestamp DEFAULT (now()),
  "imie" varchar,
  "nazwisko" varchar,
  "telefon" varchar, -- telefon jako varchar ze względu na plusy, myślniki np. '+48654765876'
  "adres_id" int,
  FOREIGN KEY ("adres_id") REFERENCES "adres"("id")
);

CREATE TABLE "opinie" (
  "id" SERIAL PRIMARY KEY,
  "uzytkownik_id" int NOT NULL,
  "napisana_o" timestamp DEFAULT (now()),
  "ocena" ocena DEFAULT '5',
  "tresc" varchar(500),
  FOREIGN KEY ("uzytkownik_id") REFERENCES "uzytkownik"("id")
);

CREATE TABLE "zamowienia" (
  "id" SERIAL PRIMARY KEY,
  "uzytkownik_id" int NOT NULL,
  "adres_id" int,
  "status" status_zamowienia NOT NULL DEFAULT 'zlozone',
  "data_zlozenia" timestamp DEFAULT (now()),
  "data_realizacji" timestamp,
  "koszt" numeric(5,2) NOT NULL,
  "koszt_dostawy" numeric(5,2) DEFAULT 5,
  "oplacone" boolean DEFAULT false,
  "opinie_id" int,
  FOREIGN KEY ("uzytkownik_id") REFERENCES "uzytkownik"("id"),
  FOREIGN KEY ("adres_id") REFERENCES "adres"("id"),
  FOREIGN KEY ("opinie_id") REFERENCES "opinie"("id")
);

CREATE TABLE "zamowiony_produkt" (
  "id" SERIAL PRIMARY KEY,
  "zamowienie_id" int NOT NULL,
  "ilosc" numeric(5,2) NOT NULL DEFAULT 1, -- ile produktów/kaw danego rodzaju zamówił klient
  FOREIGN KEY ("zamowienie_id") REFERENCES "zamowienia" ("id")
);

CREATE TABLE "rodzaje_kawy" (
  "id" SERIAL PRIMARY KEY,
  "nazwa" varchar UNIQUE NOT NULL,
  "cena_skladnikow" numeric(5,2) DEFAULT 0, -- koszt zaparzenia kawy wynikający z ceny składników, liczony przy pomocy triggera
  "marza" numeric(5,2) DEFAULT 0, -- ustawiana ręcznie przy dodawaniu rodzaju kawy
  "status" status_produktu NOT NULL DEFAULT 'niedostepny'
);

CREATE TABLE "skladniki" (
  "id" SERIAL PRIMARY KEY,
  "nazwa" varchar NOT NULL,
  "ilosc" numeric(6,2) NOT NULL DEFAULT 0, -- ile kilogramów/litrów/sztuk znajduje się w magazynie
  "jednostka" jednostka_skladnik NOT NULL,
  "cena" numeric(5,2) NOT NULL DEFAULT 0, -- cena kupna składnika hurtowo
  "status" status_produktu NOT NULL DEFAULT 'niedostepny'
);

CREATE TABLE "przepisy" (
  "rodzaj_kawy_id" int NOT NULL,
  "skladnik_id" int NOT NULL,
  "ilosc" numeric(5,2) NOT NULL,
  FOREIGN KEY ("rodzaj_kawy_id") REFERENCES "rodzaje_kawy" ("id"),
  FOREIGN KEY ("skladnik_id") REFERENCES "skladniki" ("id")
);

CREATE TABLE "wyroby_cukiernicze" (
  "id" SERIAL PRIMARY KEY,
  "nazwa" varchar NOT NULL,
  "porcja" numeric(5,2) NOT NULL, -- sugerowana porcja serwowana klientowi np. 1 sztula ciastka lub 0.15 kg ciasta
  "ilosc" numeric(6,2) NOT NULL,
  "jednostka" jednostka_wyrob_cukierniczy NOT NULL DEFAULT 'sztuka',
  "cena" numeric(5,2) NOT NULL DEFAULT 0, -- cena netto
  "marza" numeric(5,2) DEFAULT 0, -- marża ustawiana ręcznie, razem z ceną netto tworzy cenę wyrobu cukierniczego
  "status" status_produktu NOT NULL DEFAULT 'niedostepny'
);

CREATE TABLE "transakcje" (
  "id" SERIAL PRIMARY KEY,
  "wykonana_o" timestamp DEFAULT (now()),
  "wartosc" numeric(9,2) NOT NULL, -- dodatnia lub ujemna w zależności czy jest to wpływ czy wydatek
  "tytul" varchar(100) NOT NULL,
  "zamowienie_id" int, -- nie wszystkie transakcje powiązane są z zamówieniami np. kupno składników
  FOREIGN KEY ("zamowienie_id") REFERENCES "zamowienia" ("id")
);

CREATE TABLE "zamowiona_kawa" (
  "zamowiony_produkt_id" int NOT NULL,
  "rodzaj_kawy_id" int NOT NULL,
  "ilosc_cukru" ilosc_cukru DEFAULT '1',
  FOREIGN KEY ("zamowiony_produkt_id") REFERENCES "zamowiony_produkt" ("id"),
  FOREIGN KEY ("rodzaj_kawy_id") REFERENCES "rodzaje_kawy" ("id")
);

CREATE TABLE "zamowiony_wyrob_cukierniczy" (
  "zamowiony_produkt_id" int NOT NULL,
  "wyrob_cukierniczy_id" int NOT NULL,
  FOREIGN KEY ("zamowiony_produkt_id") REFERENCES "zamowiony_produkt" ("id"),
  FOREIGN KEY ("wyrob_cukierniczy_id") REFERENCES "wyroby_cukiernicze" ("id")
);

-- WIDOKI

CREATE VIEW "pelne_dane_uzytkownika"
AS SELECT
  u.id, email, zarejestrowany_o, imie, nazwisko, telefon, ulica, nr_budynku, nr_lokalu, kod_pocztowy, miasto
FROM uzytkownik u
LEFT JOIN adres a ON a.id = u.adres_id;

CREATE VIEW "konto_bankowe"
AS SELECT
 COUNT(id) as ilosc_transakcji,
 SUM(wartosc) as stan_konta,
 COUNT(CASE WHEN wartosc > 0 THEN 1 END) as ilosc_wplywow,
 COUNT(CASE WHEN wartosc < 0 THEN 1 END) as ilosc_wyplywow
FROM transakcje;

CREATE VIEW "oferta_wyrobow_cukierniczych"
AS SELECT
  id as wyrob_cukierniczy_id,
  nazwa,
  ROUND((cena + marza) * porcja, 2) as cena
FROM wyroby_cukiernicze
WHERE status != 'niedostepny'; -- jedynie dostępne wyroby ukazywane są klientowi

CREATE VIEW "oferta_kaw"
AS SELECT
  id as rodzaj_kawy_id,
  nazwa,
  cena_skladnikow + marza as cena
FROM rodzaje_kawy
WHERE status != 'niedostepny'; -- podobnie z kawami, klient widzi tylko te na które wystarczy składników

CREATE VIEW "zamowione_produkty"
AS SELECT
    z.id as zamowienie_id,
    zp.id as zamowiony_produkt_id,
    CASE
        WHEN ok.nazwa IS NULL THEN owc.nazwa
        WHEN owc.nazwa IS NULL THEN ok.nazwa
    END as nazwa,
    zp.ilosc,
    CASE
        WHEN ok.cena IS NULL THEN owc.cena
        WHEN owc.cena IS NULL THEN ok.cena
    END as cena,
    zk.ilosc_cukru,
    CASE
        WHEN ok.rodzaj_kawy_id IS NULL THEN 'bakery'
        WHEN owc.wyrob_cukierniczy_id IS NULL THEN 'coffee'
    END as typ
FROM zamowienia z
LEFT JOIN zamowiony_produkt zp ON z.id= zp.zamowienie_id
LEFT JOIN zamowiona_kawa zk ON zp.id = zk.zamowiony_produkt_id
LEFT JOIN oferta_kaw ok ON zk.rodzaj_kawy_id = ok.rodzaj_kawy_id
LEFT JOIN zamowiony_wyrob_cukierniczy zwc ON zp.id = zwc.zamowiony_produkt_id
LEFT JOIN oferta_wyrobow_cukierniczych owc ON zwc.wyrob_cukierniczy_id = owc.wyrob_cukierniczy_id;

CREATE VIEW "ulubiona_kawa"
AS SELECT
    uzytkownik_id, rodzaj_kawy_id, ROUND(SUM(zp.ilosc)) as ile_razy_zamowiona
FROM zamowienia z
INNER JOIN zamowiony_produkt zp
ON z.id = zp.zamowienie_id
INNER JOIN zamowiona_kawa zk
ON zp.id = zk.zamowiony_produkt_id
GROUP BY rodzaj_kawy_id, uzytkownik_id
ORDER BY ile_razy_zamowiona DESC;