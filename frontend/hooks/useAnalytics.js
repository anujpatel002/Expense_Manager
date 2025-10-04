import useSWR from 'swr';
import api from '../lib/api';

const fetcher = (url) => api.get(url).then((res) => res.data.data);

export const useAnalytics = () => {
  const { data: dashboardData, error: dashboardError } = useSWR('/analytics/dashboard', fetcher);
  const { data: forecast, error: forecastError } = useSWR('/analytics/forecast', fetcher);
  const { data: seasonal, error: seasonalError } = useSWR('/analytics/seasonal', fetcher);
  const { data: departments, error: departmentsError } = useSWR('/analytics/departments', fetcher);
  const { data: recommendations, error: recommendationsError } = useSWR('/analytics/recommendations', fetcher);
  const { data: heatmap, error: heatmapError } = useSWR('/analytics/heatmap', fetcher);

  return {
    dashboardData,
    forecast,
    seasonal,
    departments,
    recommendations,
    heatmap,
    isLoading: !dashboardData && !dashboardError,
    isError: dashboardError || forecastError || seasonalError || departmentsError || recommendationsError || heatmapError
  };
};