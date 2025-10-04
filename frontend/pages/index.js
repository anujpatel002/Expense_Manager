import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { 
  Receipt, 
  Shield, 
  Zap, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Globe,
  Smartphone
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Receipt, title: 'Smart OCR', desc: 'Auto-extract data from receipts' },
    { icon: Shield, title: 'Fraud Detection', desc: 'AI-powered anomaly detection' },
    { icon: TrendingUp, title: 'Analytics', desc: 'Predictive budget forecasting' },
    { icon: Zap, title: 'Automation', desc: 'Streamlined approval workflows' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 backdrop-blur-sm bg-white/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ExpenseFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Revolutionize Your
            <br />
            <span className="text-blue-600">Expense Management</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered expense tracking with smart OCR, fraud detection, and predictive analytics. 
            Transform your financial workflows today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg font-medium flex items-center justify-center">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium flex items-center justify-center">
              <Globe className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
          </div>
          
          {/* Animated Feature Showcase */}
          <div className="relative">
            <Card className="max-w-md mx-auto bg-white shadow-xl border border-gray-200 rounded-2xl">
              <CardContent className="p-8 text-center">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-500 ${
                      currentFeature === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0 p-8'
                    }`}
                  >
                    <feature.icon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="flex justify-center mt-4 space-x-2">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentFeature === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600">Everything you need for modern expense management</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Receipt, title: 'Smart OCR Processing', desc: 'Automatically extract expense data from receipt images with 95% accuracy' },
            { icon: Shield, title: 'Fraud Detection', desc: 'AI-powered anomaly detection prevents expense fraud and duplicate submissions' },
            { icon: TrendingUp, title: 'Predictive Analytics', desc: '3-month budget forecasting with 85% confidence and seasonal trend analysis' },
            { icon: Users, title: 'Team Management', desc: 'Role-based access control with department-wise expense tracking' },
            { icon: Zap, title: 'Workflow Automation', desc: 'Configurable approval workflows with percentage-based and final approver rules' },
            { icon: Smartphone, title: 'Mobile Friendly', desc: 'Responsive design with GPS location tagging for travel expenses' }
          ].map((feature, index) => (
            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-200 rounded-xl">
              <CardContent className="p-6">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '60-80%', label: 'Fraud Reduction' },
              { number: '70%', label: 'Faster Processing' },
              { number: '95%', label: 'OCR Accuracy' },
              { number: '5-15%', label: 'Cost Savings' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Expenses?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of companies already using ExpenseFlow to streamline their financial processes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-lg font-medium flex items-center justify-center">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium">
              Contact Sales
            </button>
          </div>
          <div className="flex items-center justify-center mt-8 space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">ExpenseFlow</span>
            </div>
            <div className="text-gray-600 text-center md:text-right">
              <p>© 2024 ExpenseFlow. All rights reserved.</p>
              <p className="text-sm mt-1">Powered by Infinite Loopers</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}