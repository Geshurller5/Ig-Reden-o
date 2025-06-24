import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Send, UserCheck as UserSearch, X, UserPlus, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const GerenciarNotificacoes = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const searchUsers = useCallback(async (term) => {
    if (term.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    const orQuery = term
      .split(' ')
      .filter(t => t)
      .map(t => `name.ilike.%${t}%,surname.ilike.%${t}%`)
      .join(',');

    if (!orQuery) {
        setSearchResults([]);
        setIsSearching(false);
        return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, surname, avatar')
      .or(orQuery)
      .limit(10);
      
    if (error) {
      toast({ title: "Erro na busca", description: error.message, variant: "destructive" });
    } else {
      const unselectedResults = data.filter(user => !selectedUsers.some(su => su.id === user.id));
      setSearchResults(unselectedResults);
    }
    setIsSearching(false);
  }, [toast, selectedUsers]);

  useEffect(() => {
    const handler = setTimeout(() => {
      searchUsers(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, searchUsers]);

  const addUser = (user) => {
    if (!selectedUsers.some(su => su.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchResults(searchResults.filter(res => res.id !== user.id));
    }
  };
  
  const removeUser = (user) => {
    setSelectedUsers(selectedUsers.filter(su => su.id !== user.id));
    if (searchTerm.trim() !== '' && !searchResults.some(res => res.id === user.id)) {
      setSearchResults(prevResults => [user, ...prevResults]);
    }
  };

  const handleSend = async (targetUsers) => {
    if (!title || !message) {
      toast({ title: 'Campos obrigatórios', description: 'Título e mensagem são necessários.', variant: 'destructive' });
      return;
    }
    if (targetUsers.length === 0) {
      toast({ title: 'Nenhum destinatário', description: 'Selecione ao menos um usuário ou envie para todos.', variant: 'destructive' });
      return;
    }

    setIsSending(true);

    const notifications = targetUsers.map(user => ({
      user_id: user.id,
      title,
      message,
      link: link || null,
      is_read: false,
    }));

    const { error } = await supabase.from('notifications').insert(notifications);
    setIsSending(false);

    if (error) {
      toast({ title: 'Erro ao enviar', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: 'Notificações Enviadas!',
        description: `Mensagem enviada para ${targetUsers.length} usuário(s).`,
        action: <Send className="h-5 w-5 text-green-500" />,
      });
      setTitle('');
      setMessage('');
      setLink('');
      setSelectedUsers([]);
      setSearchTerm('');
    }
  };

  const handleSendToSelected = () => {
    handleSend(selectedUsers);
  };

  const handleSendToAll = async () => {
    setIsSending(true);
    const { data, error } = await supabase.from('profiles').select('id');
    if (error) {
      setIsSending(false);
      toast({ title: 'Erro ao buscar usuários', description: error.message, variant: 'destructive' });
      return;
    }
    await handleSend(data);
    setIsSending(false);
  };


  const getInitials = (name, surname) => {
    const n = (name || '').charAt(0);
    const s = (surname || '').charAt(0);
    return `${n}${s}`.toUpperCase();
  };

  return (
    <>
      <Helmet><title>Gerenciar Notificações - Eclésia App</title></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center space-x-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Central de Notificações</h1>
              <p className="text-muted-foreground">Envie mensagens direcionadas aos membros.</p>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Compor Mensagem</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input id="title" placeholder="Ex: Ensaio do louvor" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSending} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Mensagem</Label>
                            <Textarea id="message" placeholder="Sua mensagem detalhada aqui..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} disabled={isSending}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link">Link (Opcional)</Label>
                            <Input id="link" placeholder="/escalas ou https://site.com" value={link} onChange={(e) => setLink(e.target.value)} disabled={isSending} />
                            <p className="text-xs text-muted-foreground">Use um link interno (ex: /mural) ou externo.</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                 <Card className="flex flex-col h-full">
                     <CardHeader>
                         <CardTitle>Selecionar Destinatários</CardTitle>
                         <div className="relative">
                            <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por nome..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={isSending}
                            />
                         </div>
                     </CardHeader>
                     <CardContent className="flex-grow space-y-4">
                        {isSearching && <p className="text-sm text-muted-foreground">Buscando...</p>}
                        {!isSearching && searchTerm && searchResults.length > 0 && (
                            <div className="border rounded-md max-h-40 overflow-y-auto">
                                {searchResults.map(user => (
                                    <div key={user.id} className="flex items-center p-2 hover:bg-muted/50 cursor-pointer" onClick={() => addUser(user)}>
                                        <Avatar className="h-8 w-8 mr-3">
                                            <AvatarImage src={user.avatar} alt={`${user.name} ${user.surname}`} />
                                            <AvatarFallback>{getInitials(user.name, user.surname)}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.name} {user.surname}</span>
                                        <UserPlus className="h-4 w-4 ml-auto text-primary" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {!isSearching && searchTerm && searchResults.length === 0 && (
                             <p className="text-sm text-center text-muted-foreground py-2">Nenhum usuário encontrado.</p>
                        )}

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Users className="h-4 w-4" /> Selecionados ({selectedUsers.length})</Label>
                            {selectedUsers.length > 0 ? (
                                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[50px]">
                                    {selectedUsers.map(user => (
                                        <Badge key={user.id} variant="secondary" className="flex items-center gap-2">
                                            {user.name} {user.surname}
                                            <button onClick={() => removeUser(user)} disabled={isSending}>
                                                <X className="h-3 w-3 rounded-full hover:bg-destructive hover:text-destructive-foreground" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-center text-muted-foreground py-4 border rounded-md border-dashed">
                                    Busque e adicione usuários à lista ou envie para todos.
                                </div>
                            )}
                        </div>
                     </CardContent>
                 </Card>
            </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
            <Button size="lg" className="w-full" onClick={handleSendToSelected} disabled={isSending || selectedUsers.length === 0 || !title || !message}>
                {isSending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />} Enviar para {selectedUsers.length} membro(s) selecionado(s)
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={handleSendToAll} disabled={isSending || !title || !message}>
                 {isSending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Users className="mr-2 h-5 w-5" />} Enviar para TODOS os membros
            </Button>
        </motion.div>
      </div>
    </>
  );
};

export default GerenciarNotificacoes;