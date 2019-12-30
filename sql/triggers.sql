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

-- aktualizacja statusu składnika

CREATE OR REPLACE FUNCTION zaaktualizuj_status_skladnika() RETURNS TRIGGER AS $emp_audit$
    BEGIN
        IF NEW.ilosc = 0 THEN
            NEW.status = 'niedostepny'::status_skladnika;
        ELSIF NEW.ilosc < 30 AND NEW.jednostka='kilogram'::jednostka_skladnik OR
                NEW.ilosc < 10 AND NEW.jednostka='litr'::jednostka_skladnik OR
                NEW.ilosc < 100 AND NEW.jednostka='kostka'::jednostka_skladnik THEN
            NEW.status = 'niska_dostepnosc'::status_skladnika;
        ELSE
            NEW.status = 'dostepny'::status_skladnika;
        END IF;

        RETURN NEW;
    END;
$emp_audit$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS aktualizuj_status_skladnika ON skladniki;

CREATE TRIGGER aktualizuj_status_skladnika
BEFORE INSERT OR UPDATE ON skladniki
FOR EACH ROW EXECUTE PROCEDURE zaaktualizuj_status_skladnika();
