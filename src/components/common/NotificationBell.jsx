import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error) {
            setNotifications(data);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!user) return;
        const channel = supabase
            .channel(`public:notifications:user_id=eq.${user.id}`)
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, 
                (payload) => {
                    setNotifications(prev => [payload.new, ...prev]);
                    toast({
                        title: payload.new.title,
                        description: payload.new.message,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, toast]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notification.id);
            
            if (!error) {
                 setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
                );
            }
        }
        if (notification.link) {
            navigate(notification.link);
        }
        setIsOpen(false);
    };

    const markAllAsRead = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    const clearAllNotifications = async () => {
        if (!user || notifications.length === 0) return;

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            toast({ title: "Erro ao limpar notificações", description: error.message, variant: "destructive" });
        } else {
            setNotifications([]);
            toast({ title: "Notificações limpas!" });
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute -top-1 -right-1"
                            >
                                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                                    {unreadCount}
                                </Badge>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[calc(100vw-2rem)] max-w-sm sm:w-96 p-0 border-none rounded-lg shadow-2xl bg-background/80 backdrop-blur-md" 
                align="end"
                sideOffset={8}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Notificações</h3>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button variant="link" size="sm" className="p-0 h-auto text-primary" onClick={markAllAsRead} title="Marcar todas como lidas">
                                <CheckCheck className="h-4 w-4" />
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="link" size="sm" className="p-0 h-auto text-destructive" onClick={clearAllNotifications} title="Limpar todas as notificações">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full -mr-2" onClick={() => setIsOpen(false)} title="Fechar">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-hide">
                    {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleNotificationClick(notification)}
                                className="p-4 border-b border-white/10 flex items-start gap-3 hover:bg-primary/10 cursor-pointer transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-sm pr-2">{notification.title}</p>
                                        {!notification.is_read && <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-16">
                            <Bell className="mx-auto h-12 w-12 mb-4" />
                            <p className="font-semibold">Nenhuma notificação</p>
                            <p className="text-sm">Você está em dia!</p>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;