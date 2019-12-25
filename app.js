const express = require('express');
const cors = require('cors');

const mountRoutes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

mountRoutes(app);

module.exports = app;
