import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Book, Music, Calendar, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Book, label: 'Liturgia', path: '/liturgia' },
    { icon: Music, label: 'Repertório', path: '/repertorio' },
    { icon: Home, label: 'Home', path: '/', isCenter: true },
    { icon: Calendar, label: 'Escalas', path: '/escalas' },
    { icon: BookOpen, label: 'Bíblia', path: '/biblia' },
  ];

  return (
    <motion.footer 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t"
    >
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200",
                item.isCenter 
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110 -mt-2" 
                  : isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
              )}
              whileHover={{ scale: item.isCenter ? 1.15 : 1.05 }}
              whileTap={{ scale: item.isCenter ? 1.05 : 0.95 }}
            >
              <Icon className={cn("h-5 w-5", item.isCenter && "h-6 w-6")} />
              <span className={cn(
                "text-xs mt-1 font-medium",
                item.isCenter && "text-white"
              )}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.footer>
  );
};

export default Footer;