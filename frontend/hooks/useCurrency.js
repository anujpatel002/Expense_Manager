import { useAuth } from '../context/AuthContext';
import { formatCurrencyWithDefault } from '../lib/utils';

export const useCurrency = () => {
  const { user } = useAuth();
  const defaultCurrency = user?.company?.defaultCurrency || 'USD';

  const formatAmount = (amount, currency = null) => {
    return formatCurrencyWithDefault(amount, currency, defaultCurrency);
  };

  return {
    defaultCurrency,
    formatAmount
  };
};