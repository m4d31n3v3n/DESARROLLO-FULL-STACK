const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(__dirname + '/public'));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use(errorHandler);

module.exports = app;
