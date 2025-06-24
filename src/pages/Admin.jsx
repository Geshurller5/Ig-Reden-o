import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, Music, Calendar, GraduationCap, MessageSquare, BarChart3, Crown, Shield, UserCheck, User, PlusCircle, Bell, Hand as HeartHand, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const [
        { count: totalMembers },
        { count: activeEvents },
        { count: songsInRepertoire },
        { count: ebdStudies },
        { count: muralPosts },
        { data: offeringsData }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('songs').select('*', { count: 'exact', head: true }),
        supabase.from('ebd_studies').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('offerings').select('amount')
      ]);

      const totalDonations = offeringsData ? offeringsData.reduce((sum, o) => sum + Number(o.amount || 0), 0) : 0;
      
      setStats({
        totalMembers: totalMembers ?? 0,
        activeEvents: activeEvents ?? 0,
        songsInRepertoire: songsInRepertoire ?? 0,
        ebdStudies: ebdStudies ?? 0,
        muralPosts: muralPosts ?? 0,
        totalDonations: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDonations)
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const hierarchy = [
    { level: 1, title: "Pastor", members: [{ id: 1, name: "João Silva", role: "Pastor Presidente", avatar: 'https://i.pravatar.cc/150?u=joao' }] },
    { level: 2, title: "Pastora", members: [{ id: 2, name: "Maria Silva", role: "Pastora", avatar: 'https://i.pravatar.cc/150?u=maria' }] },
    { level: 3, title: "Diáconos", members: [{ id: 3, name: "Pedro Santos", role: "Diácono", avatar: 'https://i.pravatar.cc/150?u=pedro' }] },
    { level: 4, title: "Líderes", members: [{ id: 6, name: "Marcos Oliveira", role: "Líder de Jovens", avatar: 'https://i.pravatar.cc/150?u=marcos' }] },
    { level: 5, title: "Membros", members: [{ id: 10, name: "José Ferreira", role: "Membro", avatar: 'https://i.pravatar.cc/150?u=jose' }] }
  ];

  const adminActions = [
    { title: "Gerenciar Liturgias", description: "Criar e editar liturgias", icon: Calendar, path: "/admin/gerenciar-liturgia" },
    { title: "Gerenciar Escalas", description: "Organizar escalas de eventos", icon: Users, path: "/admin/gerenciar-escalas" },
    { title: "Gerenciar Repertório", description: "Adicionar e organizar músicas", icon: Music, path: "/admin/gerenciar-repertorio" },
    { title: "Gerenciar EBD", description: "Criar estudos e lições", icon: GraduationCap, path: "/admin/gerenciar-ebd" },
    { title: "Gerenciar Mural", description: "Publicar avisos", icon: MessageSquare, path: "/mural" },
    { title: "Gerenciar Notificações", description: "Enviar alertas e avisos", icon: Bell, path: "/admin/gerenciar-notificacoes" },
    { title: "Gerenciar Ofertas", description: "Acompanhar doações", icon: HeartHand, path: "/admin/gerenciar-ofertas" },
    { title: "Relatórios de Eventos", description: "Visualizar estatísticas", icon: BarChart3, path: "/admin/gerenciar-eventos" },
  ];

  const getRoleIcon = (level) => {
    const icons = { 1: Crown, 2: Crown, 3: Shield, 4: UserCheck, 5: User };
    const colors = { 1: 'text-yellow-500', 2: 'text-pink-500', 3: 'text-blue-500', 4: 'text-green-500', 5: 'text-gray-500' };
    const Icon = icons[level] || User;
    return <Icon className={`h-5 w-5 ${colors[level] || 'text-gray-500'}`} />;
  };

  const getRoleBadgeColor = (level) => {
    const colors = {
      1: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      2: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      3: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      4: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      5: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[level] || colors[5];
  };

  const statCards = [
    { key: 'totalMembers', label: 'Membros', icon: Users, color: 'text-blue-500' },
    { key: 'activeEvents', label: 'Eventos', icon: Calendar, color: 'text-green-500' },
    { key: 'songsInRepertoire', label: 'Músicas', icon: Music, color: 'text-purple-500' },
    { key: 'ebdStudies', label: 'Estudos', icon: GraduationCap, color: 'text-orange-500' },
    { key: 'muralPosts', label: 'Posts', icon: MessageSquare, color: 'text-red-500' },
    { key: 'totalDonations', label: 'Doações', icon: HeartHand, color: 'text-pink-500' },
  ];

  return (
    <>
      <Helmet>
        <title>Administração - Eclésia App</title>
      </Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2"><Settings className="h-8 w-8 text-primary" /><h1 className="text-3xl font-bold gradient-text">Administração</h1></div>
          <p className="text-muted-foreground">Painel de controle para gerenciar a igreja</p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="management">Gerenciamento</TabsTrigger>
            <TabsTrigger value="hierarchy">Organograma</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map(({ key, label, icon: Icon, color }) => (
                <Card key={key} className="text-center p-4">
                  <div className="flex flex-col items-center space-y-2 h-full justify-center">
                    <Icon className={`h-8 w-8 ${color}`} />
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <div><p className="text-2xl font-bold">{stats[key]}</p><p className="text-sm text-muted-foreground">{label}</p></div>
                    )}
                  </div>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div key={action.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group h-full" onClick={() => navigate(action.path)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300"><Icon className="h-6 w-6" /></div>
                          <div><CardTitle className="text-lg">{action.title}</CardTitle><CardDescription className="text-sm">{action.description}</CardDescription></div>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>

          <TabsContent value="hierarchy" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center"><h2 className="text-2xl font-bold mb-2">Organograma da Igreja</h2><p className="text-muted-foreground">Estrutura hierárquica da liderança</p></div>
              {hierarchy.map((level, levelIndex) => (
                <motion.div key={level.level} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + levelIndex * 0.1 }}>
                  <Card><CardHeader className="pb-3"><div className="flex items-center space-x-3">{getRoleIcon(level.level)}<CardTitle className="text-xl">{level.title}</CardTitle><Badge className={getRoleBadgeColor(level.level)}>{level.members.length} {level.members.length === 1 ? 'pessoa' : 'pessoas'}</Badge></div></CardHeader><CardContent><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {level.members.map((member, memberIndex) => (
                      <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + levelIndex * 0.1 + memberIndex * 0.05 }} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <Avatar className="h-12 w-12"><AvatarImage src={member.avatar} alt={member.name} /><AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                        <div><p className="font-medium">{member.name}</p><p className="text-sm text-muted-foreground">{member.role}</p></div>
                      </motion.div>
                    ))}
                  </div></CardContent></Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Admin;