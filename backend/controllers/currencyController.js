const axios = require('axios');
const ApiError = require('../utils/apiError');

const getCountriesAndCurrencies = async (req, res, next) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    
    const countriesWithCurrencies = response.data
      .filter(country => country.currencies)
      .map(country => ({
        name: country.name.common,
        currencies: Object.keys(country.currencies).map(code => ({
          code,
          name: country.currencies[code].name,
          symbol: country.currencies[code].symbol
        }))
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      success: true,
      data: { countries: countriesWithCurrencies }
    });
  } catch (error) {
    next(new ApiError(500, 'Failed to fetch countries and currencies'));
  }
};

const getExchangeRates = async (req, res, next) => {
  try {
    const { baseCurrency } = req.params;
    
    if (!baseCurrency || baseCurrency.length !== 3) {
      return next(new ApiError(400, 'Valid base currency code required'));
    }

    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency.toUpperCase()}`);
    
    res.json({
      success: true,
      data: {
        base: response.data.base,
        date: response.data.date,
        rates: response.data.rates
      }
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return next(new ApiError(400, 'Invalid currency code'));
    }
    next(new ApiError(500, 'Failed to fetch exchange rates'));
  }
};

module.exports = {
  getCountriesAndCurrencies,
  getExchangeRates
};