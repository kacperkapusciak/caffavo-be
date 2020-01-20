# Caffavo
Firma poświęcona parzeniu i dostarczaniu kawy.

[https://kacperkapusciak.github.io/caffavo-fe/](https://kacperkapusciak.github.io/caffavo-fe/)

Przykładowe konto użytkownika:
```
Login: user-2@caffavo.com
Hasło: 1234567890
```
Przykładowe konto administratora:
```$xslt
Login: admin@caffavo.com
Hasło: password
```

## Założenia projektowe:
### Ogólnie dla systemu:
- [x] Każdy rodzaj kawy ma swój przepis.
- [ ] Po przygotowaniu kawy jest zużywana odpowiednia ilość składników.

#### System umozliwia zarządzanie:
- [x] ilością składników dostępnych w magazynie (kilogramy kawy, cukru, litry mleka, syropów etc.)
- [x] zamówieniami, użytkownikami, przepisami, rodzajami kawy oraz składnikami
- [x] Kalkulować koszt danego zamówienia:
koszt zamówenia = ilość kaw * (cena składników + marża) + ilość produktów * (cena + marża) + koszt dostawy. 'Produktem' jest np. sernik, szarlotka, ciastko itp.
- [x] Blokować możliwość zamawiania kaw na które nie ma składników
- [x] Na bieżąco kalkulować ilość kaw które mogą zostać zaparzone z danych składników oraz informować administratora o brakach.

#### Jako użytkownik mogę:
- [x] zarejestrować się na stronie
- [x] edytować swoje dane, również adresowe (imię, nazwisko, telefon, email, haslo, adres zamieszkania
- [x] przeglądać menu dostępnych kaw oraz produktów wraz z ich cenami
- [x] złożyć zamówienie na kawy/produkty przeze mnie wybrane, poznać koszt zamówienia i status jego realizacji w każdym z jego etapów (przyjęte do realizacji, w trakcie, anulowane, zrealizowane) 
- [x] anulować zamówienie (do 5 minut po złożeniu zamówienia)
- [ ] wyrazic swoje zadowolenie w postaci opinii do zrealizowanego zamówienia
- [x] mieć podgląd na moje zamówienia, również przeszłe
- [x] poznac moją ulubioną kawę - najczesciej przeze mnie zamawianą

#### Jako administator mogę:
- [ ] dodawać nowe rodzaje składników, przepisów, produktów i rodzajów kawy
- [x] uzupełniać braki w magazynach tj. kupować składniki, produkty
- [x] zarządzać finansami - bilans konta, pieniądze z zamówień, koszta składników, koszta dostawy, nadawanie marży na produkty oraz kawy
- [x] zarządzać zamówieniami, znać ich stan, ilość, edytować, tworzyć, usuwać
- [x] znać najpopularniejsze kawy zamawiane przez klientów
- [ ] mieć możliwość poznania opinii klientów i umieszczania na stronie głównej

Zaznaczone pola oznajmiają, które założenia udało się zrealizować.

## Diagramy
### Diagram Przepływu Danych
Diagram można znaleźć pod: [diagrams/DFD.pdf](diagrams/DFD.pdf)

### Diagram ERD
Diagram znajduje się pod: [diagrams/ERD.pdf](diagrams/ERD.pdf)

## Projekt logiczny
Tabele, typy oraz widoki wraz z komentarzami znajdują się w pliku [sql/init.sql](sql/init.sql).

## Operacje na danych

##### Logowanie użytkownika: [routes/auth.js#L43](routes/auth.js#L43)
```sql
SELECT id, email, admin 
FROM uzytkownik 
WHERE email=${email} AND haslo=${password};
```

##### Rejestracja/dodawanie użytkowników: 
[routes/users.js#L154](routes/users.js#L154)
```sql
INSERT INTO uzytkownik (email, haslo) 
VALUES (${email}, ${password})`);
```
[routes/users.js#L158](routes/users.js#L158)
```sql
INSERT INTO uzytkownik (email, haslo, imie, nazwisko, telefon) 
VALUES (${email}, ${password}, ${firstName}, ${lastName}, ${phone})`);
```

