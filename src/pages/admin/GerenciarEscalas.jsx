import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, PlusCircle, Edit, Trash2, Share2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const GerenciarEscalas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
      .order('event_date', { ascending: false });

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

  const handleDelete = async (eventId) => {
    const { error: assignmentError } = await supabase
      .from('event_assignments')
      .delete()
      .eq('event_id', eventId);

    if (assignmentError) {
      toast({ title: "Erro ao excluir escalas", description: assignmentError.message, variant: "destructive" });
      return;
    }

    const { error: eventError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (eventError) {
      toast({ title: "Erro ao excluir evento", description: eventError.message, variant: "destructive" });
    } else {
      toast({ title: "Escala excluída!", description: "A escala e suas atribuições foram removidas." });
      fetchSchedules();
    }
  };

  const handleShare = (event) => {
    toast({
      title: "🚧 Funcionalidade em desenvolvimento!",
      description: "A integração com agendas externas estará disponível em breve.",
    });
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
      case 'culto': return 'border-l-blue-500';
      case 'ebd': return 'border-l-green-500';
      case 'oracao': return 'border-l-purple-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <Helmet><title>Gerenciar Escalas - Eclésia App</title></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold gradient-text">Gerenciar Escalas</h1>
                <p className="text-muted-foreground">Visualize, edite e crie novas escalas de eventos.</p>
              </div>
            </div>
            <Button onClick={() => navigate('/admin/criar-escala')}><PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Escala</Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : events.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma escala encontrada</h3>
            <p className="text-muted-foreground">Crie uma nova escala para começar.</p>
            <Button onClick={() => navigate('/admin/criar-escala')} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Criar Escala</Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
                <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${getEventTypeColor(event.type)}`}>
                  <CardHeader>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>{formatDate(event.event_date)}</span></div>
                      <div className="flex items-center space-x-1"><Clock className="h-4 w-4" /><span>{event.event_time}</span></div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center space-x-2"><Users className="h-4 w-4" /><span>Responsáveis</span></h3>
                      <div className="space-y-2">
                        {event.assignments.map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div>
                              <p className="font-medium">{assignment.profile?.name} {assignment.profile?.surname}</p>
                              <p className="text-sm text-muted-foreground">{assignment.role}</p>
                            </div>
                            {getStatusBadge(assignment.status)}
                          </div>
                        ))}
                        {event.assignments.length === 0 && <p className="text-sm text-muted-foreground">Ninguém escalado.</p>}
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleShare(event)}><Share2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/editar-escala/${event.id}`)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso excluirá permanentemente a escala e todas as suas atribuições.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(event.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default GerenciarEscalas;