Na localu baza jest na caffavo_api

```bash
sudo -i -u caffavo_api_user
psql
\c caffavo_api
```

Na produkcji baza jest pod

```
heroku pg:psql postgresql-perpendicular-76832 --app caffavo
```