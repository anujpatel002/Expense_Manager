import useSWR from 'swr';
import api from '../lib/api';

const fetcher = (url) => api.get(url).then((res) => res.data.data);

export const useMyExpenses = () => {
  const { data, error, mutate } = useSWR('/expenses/my-expenses', fetcher);
  
  return {
    expenses: data?.expenses || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export const usePendingApprovals = () => {
  const { data, error, mutate } = useSWR('/expenses/pending-approval', fetcher);
  
  return {
    expenses: data?.expenses || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export const useCompanyExpenses = () => {
  const { data, error, mutate } = useSWR('/expenses/company-expenses', fetcher);
  
  return {
    expenses: data?.expenses || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};

export const useCreateExpense = () => {
  const createExpense = async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  };

  const uploadReceipt = async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    const response = await api.post('/expenses/upload-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  const updateExpenseStatus = async (expenseId, status, comment) => {
    const response = await api.put(`/expenses/${expenseId}/status`, {
      status,
      comment,
    });
    return response.data;
  };

  return {
    createExpense,
    uploadReceipt,
    updateExpenseStatus,
  };
};