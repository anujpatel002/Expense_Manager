const express = require('express');
const { getCountriesAndCurrencies, getExchangeRates } = require('../controllers/currencyController');

const router = express.Router();

router.get('/countries', getCountriesAndCurrencies);
router.get('/rates/:baseCurrency', getExchangeRates);

module.exports = router;