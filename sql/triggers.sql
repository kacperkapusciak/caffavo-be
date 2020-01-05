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

-- aktualizacja statusu dostępności kawy

CREATE OR REPLACE FUNCTION zaaktualizuj_status_kawy() RETURNS TRIGGER AS $emp_audit$
    BEGIN
        UPDATE rodzaje_kawy
        SET status = sub.status
        FROM (
            SELECT
                rodzaj_kawy_id,
                CASE
                    WHEN EVERY(status='dostepny' OR status='niska_dostepnosc') THEN 'dostepny'::status_produktu
                ELSE
                    'niedostepny'::status_produktu
                END as status
            FROM przepisy p
            JOIN skladniki s
            ON s.id = p.skladnik_id
            GROUP BY rodzaj_kawy_id
        ) as sub
        WHERE id = sub.rodzaj_kawy_id;
        RETURN NULL;
    END;
$emp_audit$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS aktualizuj_status_kawy ON przepisy;

CREATE TRIGGER aktualizuj_status_kawy
AFTER INSERT OR UPDATE OR DELETE ON przepisy
FOR EACH ROW EXECUTE PROCEDURE zaaktualizuj_status_kawy();

-- aktualizacja statusu składnika

CREATE OR REPLACE FUNCTION zaaktualizuj_status_produktu() RETURNS TRIGGER AS $emp_audit$
    BEGIN
        IF NEW.ilosc = 0 THEN
            NEW.status = 'niedostepny'::status_produktu;
        ELSIF NEW.ilosc < 30 AND NEW.jednostka='kilogram'::jednostka_skladnik OR
                NEW.ilosc < 10 AND NEW.jednostka='litr'::jednostka_skladnik OR
                NEW.ilosc < 100 AND NEW.jednostka='kostka'::jednostka_skladnik THEN
            NEW.status = 'niska_dostepnosc'::status_produktu;
        ELSE
            NEW.status = 'dostepny'::status_produktu;
        END IF;

        RETURN NEW;
    END;
$emp_audit$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS aktualizuj_status_produktu ON skladniki;

CREATE TRIGGER aktualizuj_status_produktu
BEFORE INSERT OR UPDATE ON skladniki
FOR EACH ROW EXECUTE PROCEDURE zaaktualizuj_status_produktu();

-- aktualizacja statusu wyrobu cukierniczego

CREATE OR REPLACE FUNCTION zaaktualizuj_status_wyrobu_cukierniczego() RETURNS TRIGGER AS $emp_audit$
    BEGIN
        IF NEW.ilosc = 0 THEN
            NEW.status = 'niedostepny'::status_produktu;
        ELSIF NEW.ilosc < 50 AND NEW.jednostka='kilogram'::jednostka_wyrob_cukierniczy OR
                NEW.ilosc < 400 AND NEW.jednostka='sztuka'::jednostka_wyrob_cukierniczy THEN
            NEW.status = 'niska_dostepnosc'::status_produktu;
        ELSE
            NEW.status = 'dostepny'::status_produktu;
        END IF;

        RETURN NEW;
    END;
$emp_audit$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS aktualizuj_status_wyrobu_cukierniczego ON wyroby_cukiernicze;

CREATE TRIGGER aktualizuj_status_wyrobu_cukierniczego
BEFORE INSERT OR UPDATE ON wyroby_cukiernicze
FOR EACH ROW EXECUTE PROCEDURE zaaktualizuj_status_wyrobu_cukierniczego();

-- dodanie transakcji po kupnie skladnikow

CREATE OR REPLACE FUNCTION kup_skladnik() RETURNS TRIGGER AS $emp_audit$
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            IF (NEW.ilosc > 0) THEN
                INSERT INTO transakcje (wartosc, tytul)
                VALUES (-1 * NEW.ilosc * NEW.cena, CONCAT('Kupno skladnika: ', NEW.nazwa));
            END IF;
        ELSIF (TG_OP = 'UPDATE') THEN
            IF (NEW.ilosc > OLD.ilosc) THEN
                INSERT INTO transakcje (wartosc, tytul)
                VALUES (-1 * NEW.ilosc * NEW.cena, CONCAT('Kupno skladnika: ', NEW.nazwa));
            END IF;
        END IF;
        RETURN NEW;
    END;
$emp_audit$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kupno_skladnika ON skladniki;

CREATE TRIGGER kupno_skladnika
AFTER INSERT OR UPDATE ON skladniki
FOR EACH ROW EXECUTE PROCEDURE kup_skladnik();

-- dodanie transakcji po kupnie wyrobu cukierniczego

CREATE OR REPLACE FUNCTION kup_wyrob_cukierniczy() RETURNS TRIGGER AS $emp_audit$
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            IF (NEW.ilosc > 0) THEN
                INSERT INTO transakcje (wartosc, tytul)
                VALUES (-1 * NEW.ilosc * NEW.cena, CONCAT('Kupno wyrobu cukierniczego: ', NEW.nazwa));
            END IF;
        ELSIF (TG_OP = 'UPDATE') THEN
            IF (NEW.ilosc > OLD.ilosc) THEN
                INSERT INTO transakcje (wartosc, tytul)
                VALUES (-1 * NEW.ilosc * NEW.cena, CONCAT('Kupno wyrobu cukierniczego: ', NEW.nazwa));
            END IF;
        END IF;
        RETURN NEW;
    END;
$emp_audit$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kupno_wyrobu_cukierniczego ON wyroby_cukiernicze;

CREATE TRIGGER kupno_wyrobu_cukierniczego
AFTER INSERT OR UPDATE ON wyroby_cukiernicze
FOR EACH ROW EXECUTE PROCEDURE kup_wyrob_cukierniczy();
