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

