import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import ThemeToggle from './ThemeToggle';
import { LogOut, User, Receipt, Users, Settings, Building, BarChart3, Sparkles, Database } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const navigation = [
    { name: 'My Expenses', href: '/dashboard', icon: Receipt },
    ...(user?.role === 'Manager' || user?.role === 'Admin' 
      ? [
          { name: 'Team Expenses', href: '/dashboard/team-expenses', icon: Users },
          { name: 'Approvals', href: '/dashboard/approvals', icon: Settings },
          { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 }
        ] 
      : []),
    ...(user?.role === 'Admin' 
      ? [
          { name: 'Company Expenses', href: '/dashboard/company-expenses', icon: Building },
          { name: 'Users', href: '/dashboard/users', icon: Users },
          { name: 'Workflows', href: '/dashboard/workflows', icon: Settings },
          { name: 'Seed Data', href: '/dashboard/seed-data', icon: Database }
        ] 
      : []),
  ];

  return (
    <div className="min-h-screen bg-background transition-all duration-300">
      {/* AI-inspired navigation */}
      <nav className="ai-nav bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2 group">
                <div className="relative">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse-custom" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300" />
                </div>
                <span className="text-xl font-bold gradient-text">
                  Expense Manager
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-surface rounded-full border border-border">
                <div className="relative">
                  <User className="h-5 w-5 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-text">{user?.name}</span>
                  <span className="text-xs text-textSecondary">{user?.role}</span>
                </div>
              </div>
              
              <ThemeToggle />
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="hover:bg-error/10 hover:text-error transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* AI-inspired sidebar */}
        <aside className="w-64 ai-sidebar min-h-screen relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
          
          <nav className="relative z-10 mt-8">
            <div className="px-4 space-y-2">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`ai-sidebar-item group ${
                      isActive ? 'active' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative">
                      <Icon className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      {isActive && (
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-sm" />
                      )}
                    </div>
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse-custom" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
          
          {/* Sidebar footer */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="ai-card p-3 text-center">
              <div className="text-xs text-textSecondary mb-1">Powered by</div>
              <div className="text-sm font-semibold gradient-text">Infinite Loopers</div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 bg-background relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-primary rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="relative z-10 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;