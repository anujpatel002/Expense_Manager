import { useState } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useCurrency } from '../../hooks/useCurrency';
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  BarChart3, 
  PieChart,
  Shield,
  Calendar,
  Building2
} from 'lucide-react';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const { defaultCurrency, formatAmount } = useCurrency();
  const { 
    dashboardData, 
    forecast, 
    seasonal, 
    departments, 
    recommendations, 
    heatmap,
    isLoading 
  } = useAnalytics();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'recommendations', label: 'Recommendations', icon: AlertTriangle }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <BarChart3 className="h-8 w-8 mr-3" />
            Analytics Dashboard
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1"
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Next Month Forecast */}
            {dashboardData.forecast?.[0] && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Next Month Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatAmount(dashboardData.forecast[0].predictedAmount)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Confidence: {(dashboardData.forecast[0].confidence * 100).toFixed(0)}%
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Top Department */}
            {dashboardData.topDepartments?.[0] && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Top Spending Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {dashboardData.topDepartments[0]._id || 'General'}
                  </div>
                  <div className="text-lg text-blue-600">
                    {formatAmount(dashboardData.topDepartments[0].totalAmount)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {dashboardData.topDepartments[0].expenseCount} expenses
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Urgent Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Urgent Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {dashboardData.urgentRecommendations?.length || 0}
                </div>
                <p className="text-sm text-gray-600">
                  High priority recommendations
                </p>
                {dashboardData.urgentRecommendations?.[0] && (
                  <p className="text-xs text-gray-500 mt-2">
                    {dashboardData.urgentRecommendations[0].description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Trends */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Spending Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {dashboardData.trends?.map((trend, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg font-semibold">{trend.month}</div>
                      <div className="text-blue-600">
                        {formatAmount(trend.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trend.expenseCount} expenses
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Forecast Tab */}
        {activeTab === 'forecast' && forecast && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecast.forecast?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">Month {item.month}</div>
                        <div className="text-sm text-gray-600">
                          Confidence: {(item.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {formatAmount(item.predictedAmount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historical Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {forecast.historical?.slice(-6).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{item._id.year}-{item._id.month.toString().padStart(2, '0')}</span>
                      <span className="font-medium">
                        {formatAmount(item.totalAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && departments && (
          <Card>
            <CardHeader>
              <CardTitle>Department Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Department</th>
                      <th className="text-left py-3 px-4">Total Amount</th>
                      <th className="text-left py-3 px-4">Expenses</th>
                      <th className="text-left py-3 px-4">Avg Amount</th>
                      <th className="text-left py-3 px-4">Categories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.departments?.map((dept, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {dept._id || 'General'}
                        </td>
                        <td className="py-3 px-4">
                          {formatAmount(dept.totalAmount)}
                        </td>
                        <td className="py-3 px-4">{dept.expenseCount}</td>
                        <td className="py-3 px-4">
                          {formatAmount(dept.avgAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {dept.categories?.slice(0, 3).map((cat, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {cat}
                              </span>
                            ))}
                            {dept.categories?.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{dept.categories.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && recommendations && (
          <div className="space-y-4">
            {recommendations.recommendations?.map((rec, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className={`h-5 w-5 mr-2 ${
                          rec.priority === 'HIGH' ? 'text-red-500' : 
                          rec.priority === 'MEDIUM' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rec.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 
                          rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2">{rec.type.replace('_', ' ')}</h3>
                      <p className="text-gray-600 mb-2">{rec.description}</p>
                      <div className="text-sm text-green-600">
                        Potential savings: {formatAmount(rec.potentialSavings)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}