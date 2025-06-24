import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sun, Moon, Menu, LogOut, Home as HomeIcon, LayoutDashboard, Calendar, Music, BookOpen, Users, Bell, Coins as HandCoins, Clapperboard, CalendarCheck, Network } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Estúdio', path: '/admin/studio', icon: Clapperboard },
    { name: 'Criar Escala', path: '/admin/criar-escala', icon: Calendar },
    { name: 'Gerenciar Escalas', path: '/admin/gerenciar-escalas', icon: CalendarCheck },
    { name: 'Gerenciar Liturgia', path: '/admin/gerenciar-liturgia', icon: BookOpen },
    { name: 'Gerenciar Repertório', path: '/admin/gerenciar-repertorio', icon: Music },
    { name: 'Gestão Organograma', path: '/admin/gerenciar-organograma', icon: Network },
    { name: 'Gerenciar EBD', path: '/admin/gerenciar-ebd', icon: Users },
    { name: 'Gerenciar Eventos', path: '/admin/gerenciar-eventos', icon: CalendarCheck },
    { name: 'Gerenciar Notificações', path: '/admin/gerenciar-notificacoes', icon: Bell },
    { name: 'Gerenciar Ofertas', path: '/admin/gerenciar-ofertas', icon: HandCoins },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold gradient-text">Painel Admin</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors text-base font-medium ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`
              }
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 mt-auto border-t">
        <Button variant="ghost" className="w-full justify-start text-base" onClick={() => navigate('/')}>
          <HomeIcon className="mr-3 h-5 w-5" />
          Voltar para o App
        </Button>
        <Button variant="ghost" className="w-full justify-start text-base" onClick={handleLogout}>
          <LogOut className="mr-3 h-5 w-5 text-red-500" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-muted/40">
      <aside className="hidden md:flex w-64 flex-col border-r">
        <NavContent />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;