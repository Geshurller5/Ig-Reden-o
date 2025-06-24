import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const Escalas = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        assignments:event_assignments (
          *,
          profile:profiles (*)
        )
      `)
      .order('event_date', { ascending: true });

    if (error) {
      toast({ title: "Erro ao buscar escalas", description: error.message, variant: "destructive" });
    } else {
      setEvents(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handlePresence = async (assignmentId, newStatus) => {
    if (!user) return;
    const { error } = await supabase
      .from('event_assignments')
      .update({ status: newStatus })
      .eq('id', assignmentId);

    if (error) {
      toast({ title: "Erro ao atualizar presença", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: `Presença ${newStatus === 'confirmed' ? 'confirmada' : 'recusada'}!`,
        description: `Sua participação foi registrada com sucesso.`,
      });
      fetchSchedules(); // Refresh the data
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="mr-1 h-3 w-3" />Confirmado</Badge>;
      case 'declined': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Recusado</Badge>;
      default: return <Badge variant="secondary"><AlertCircle className="mr-1 h-3 w-3" />Aguardando</Badge>;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'culto': return 'from-blue-500 to-cyan-500';
      case 'ebd': return 'from-green-500 to-emerald-500';
      case 'oracao': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  return (
    <>
      <Helmet><title>Escalas - Eclésia App</title><meta name="description" content="Visualize e confirme sua participação nas escalas de eventos da igreja." /></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2"><Calendar className="h-8 w-8 text-primary" /><h1 className="text-3xl font-bold gradient-text">Escalas</h1></div>
          <p className="text-muted-foreground">Confira os próximos eventos e confirme sua participação</p>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground py-16">
            <p>Nenhuma escala publicada no momento.</p>
            <p className="text-sm">O administrador pode criar novas escalas no painel de gerenciamento.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {events.map((event, index) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2"><div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getEventTypeColor(event.type)}`} /><CardTitle className="text-xl">{event.title}</CardTitle></div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>{formatDate(event.event_date)}</span></div>
                          <div className="flex items-center space-x-1"><Clock className="h-4 w-4" /><span>{event.event_time}</span></div>
                          <div className="flex items-center space-x-1"><MapPin className="h-4 w-4" /><span>{event.location || 'A definir'}</span></div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center space-x-2"><Users className="h-4 w-4" /><span>Responsáveis</span></h3>
                      <div className="space-y-3">
                        {event.assignments.map((assignment) => (
                          <div key={assignment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-muted/50 gap-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10"><AvatarImage src={assignment.profile?.avatar} alt={assignment.profile?.name} /><AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">{assignment.profile?.name?.charAt(0)}</AvatarFallback></Avatar>
                              <div><p className="font-medium">{assignment.profile?.name} {assignment.profile?.surname}</p><p className="text-sm text-muted-foreground">{assignment.role}</p></div>
                            </div>
                            <div className="flex items-center space-x-3 self-end sm:self-center">
                              {getStatusBadge(assignment.status)}
                              {assignment.status === 'pending' && user && assignment.user_id === user.id && (
                                <div className="flex space-x-2">
                                  <Button size="sm" onClick={() => handlePresence(assignment.id, 'confirmed')} className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-4 w-4 mr-1" />Aceitar</Button>
                                  <Button size="sm" variant="destructive" onClick={() => handlePresence(assignment.id, 'declined')}><XCircle className="h-4 w-4 mr-1" />Recusar</Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                         {event.assignments.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Ninguém escalado para este evento ainda.</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Escalas;