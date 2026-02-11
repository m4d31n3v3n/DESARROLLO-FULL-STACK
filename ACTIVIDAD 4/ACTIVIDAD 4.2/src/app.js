const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('src/public'));

app.use('/auth', require('./routes/auth.routes'));
app.use('/products', require('./routes/product.routes'));

module.exports = app;
