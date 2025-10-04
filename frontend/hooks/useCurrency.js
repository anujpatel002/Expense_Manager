import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export const useCurrency = () => {
  const { user } = useAuth();
  const [currencySymbols, setCurrencySymbols] = useState({});
  
  useEffect(() => {
    const fetchCurrencySymbols = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
        const countries = await response.json();
        
        const symbols = {};
        countries.forEach(country => {
          if (country.currencies) {
            Object.entries(country.currencies).forEach(([code, info]) => {
              if (info.symbol && !symbols[code]) {
                symbols[code] = info.symbol;
              }
            });
          }
        });
        
        setCurrencySymbols(symbols);
      } catch (error) {
        console.error('Failed to fetch currency symbols:', error);
        setCurrencySymbols({
          INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥',
          CAD: 'C$', AUD: 'A$', CHF: 'CHF', CNY: '¥', SEK: 'kr'
        });
      }
    };
    
    fetchCurrencySymbols();
  }, []);
  
  const defaultCurrency = user?.company?.defaultCurrency || 'INR';
  
  const getCurrencySymbol = (currency) => {
    const currencyCode = currency || defaultCurrency;
    return currencySymbols[currencyCode] || currencyCode;
  };
  
  const formatAmount = (amount) => {
    const symbol = getCurrencySymbol(defaultCurrency);
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
    
    return `${symbol}${formattedAmount}`;
  };

  return {
    defaultCurrency,
    getCurrencySymbol,
    formatAmount
  };
};

export const useExchangeRates = (baseCurrency = 'USD') => {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/currency/rates/${baseCurrency}`);
        setRates(response.data.data.rates);
        setError(null);
      } catch (err) {
        setError(err.message);
        // Fallback rates for demo purposes
        setRates({
          USD: 1,
          EUR: 0.85,
          GBP: 0.73,
          JPY: 110,
          CAD: 1.25,
          AUD: 1.35
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [baseCurrency]);

  return { rates, loading, error };
};