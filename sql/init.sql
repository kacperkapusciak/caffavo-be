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
  "admin" boolean NOT NULL DEFAULT false,
  "zarejestrowany_o" timestamp DEFAULT (now()),
  "imie" varchar,
  "nazwisko" varchar,
  "telefon" varchar,
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
  "adres_id" int NOT NULL,
  "status" status_zamowienia NOT NULL DEFAULT 'zlozone',
  "data_zlozenia" timestamp DEFAULT (now()),
  "data_realizacji" timestamp,
  "koszt" numeric(5,2) NOT NULL,
  "koszt_dostawy" numeric(5,2),
  "oplacone" boolean DEFAULT false,
  "opinie_id" int,
  FOREIGN KEY ("uzytkownik_id") REFERENCES "uzytkownik"("id"),
  FOREIGN KEY ("adres_id") REFERENCES "adres"("id"),
  FOREIGN KEY ("opinie_id") REFERENCES "opinie"("id")
);

CREATE TABLE "zamowiony_produkt" (
  "id" SERIAL PRIMARY KEY,
  "zamowienie_id" int NOT NULL,
  "ilosc" numeric(5,2) NOT NULL DEFAULT 1,
  FOREIGN KEY ("zamowienie_id") REFERENCES "zamowienia" ("id")
);

CREATE TABLE "rodzaje_kawy" (
  "id" SERIAL PRIMARY KEY,
  "nazwa" varchar UNIQUE NOT NULL,
  "cena_skladnikow" numeric(5,2) DEFAULT 0,
  "marza" numeric(5,2) DEFAULT 0,
  "status" status_produktu NOT NULL DEFAULT 'niedostepny'
);

CREATE TABLE "skladniki" (
  "id" SERIAL PRIMARY KEY,
  "nazwa" varchar NOT NULL,
  "ilosc" numeric(6,2) NOT NULL DEFAULT 0,
  "jednostka" jednostka_skladnik NOT NULL,
  "cena" numeric(5,2) NOT NULL DEFAULT 0,
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
  "porcja" numeric(5,2) NOT NULL,
  "ilosc" numeric(6,2) NOT NULL,
  "jednostka" jednostka_wyrob_cukierniczy NOT NULL DEFAULT 'sztuka',
  "cena" numeric(5,2) NOT NULL DEFAULT 0,
  "marza" numeric(5,2) DEFAULT 0,
  "status" status_produktu NOT NULL DEFAULT 'niedostepny'
);

CREATE TABLE "transakcje" (
  "id" SERIAL PRIMARY KEY,
  "wykonana_o" timestamp DEFAULT (now()),
  "wartosc" numeric(9,2) NOT NULL,
  "tytul" varchar(100) NOT NULL,
  "zamowienie_id" int,
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
WHERE status != 'niedostepny';

CREATE VIEW "oferta_kaw"
AS SELECT
  id as rodzaj_kawy_id,
  nazwa,
  cena_skladnikow + marza as cena
FROM rodzaje_kawy
WHERE status != 'niedostepny';