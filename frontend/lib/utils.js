import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Context-aware currency formatter
export const formatCurrencyWithDefault = (amount, currency, defaultCurrency = 'USD') => {
  const currencyToUse = currency || defaultCurrency;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyToUse,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};