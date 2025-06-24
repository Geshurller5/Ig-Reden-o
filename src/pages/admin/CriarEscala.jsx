import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { PlusCircle, Trash2, Save, Loader2, CalendarPlus, Edit } from 'lucide-react';
import { createNotificationForAllUsers } from '@/lib/notificationUtils';

const CriarEscala = () => {
  const navigate = useNavigate();
  const { id: eventId } = useParams();
  const isEditMode = !!eventId;
  const { toast } = useToast();

  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(eventId || '');
  const [assignments, setAssignments] = useState([{ user_id: '', role: '' }]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageTitle, setPageTitle] = useState('Criar Nova Escala');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, name, surname')
      .order('name', { ascending: true });

    if (usersError) {
      toast({ title: "Erro ao buscar usuários", description: usersError.message, variant: "destructive" });
    } else {
      setUsers(usersData);
    }

    if (isEditMode) {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, title, event_date')
        .eq('id', eventId)
        .single();
      
      if (eventError || !eventData) {
        toast({ title: "Erro ao buscar evento", description: "Evento não encontrado para edição.", variant: "destructive" });
        navigate('/admin/gerenciar-escalas');
        return;
      }
      setEvents([eventData]);
      setSelectedEvent(eventData.id);
      setPageTitle(`Editando Escala: ${eventData.title}`);

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('event_assignments')
        .select('user_id, role')
        .eq('event_id', eventId);
      
      if (assignmentsError) {
        toast({ title: "Erro ao buscar responsáveis", description: assignmentsError.message, variant: "destructive" });
      } else if (assignmentsData.length > 0) {
        setAssignments(assignmentsData);
      }
    } else {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title, event_date')
        .order('event_date', { ascending: false });

      if (eventsError) {
        toast({ title: "Erro ao buscar eventos", description: eventsError.message, variant: "destructive" });
      } else {
        setEvents(eventsData);
      }
      setPageTitle('Criar Nova Escala');
    }

    setLoading(false);
  }, [toast, isEditMode, eventId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddAssignment = () => {
    setAssignments([...assignments, { user_id: '', role: '' }]);
  };

  const handleRemoveAssignment = (index) => {
    const newAssignments = assignments.filter((_, i) => i !== index);
    setAssignments(newAssignments);
  };

  const handleAssignmentChange = (index, field, value) => {
    const newAssignments = [...assignments];
    newAssignments[index][field] = value;
    setAssignments(newAssignments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) {
      toast({ title: "Selecione um evento", description: "Você precisa escolher um evento para criar a escala.", variant: "destructive" });
      return;
    }

    const validAssignments = assignments.filter(a => a.user_id && a.role.trim());
    if (validAssignments.length === 0) {
      toast({ title: "Nenhuma atribuição válida", description: "Adicione pelo menos um responsável com uma função.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    
    if (isEditMode) {
      const { error: deleteError } = await supabase
        .from('event_assignments')
        .delete()
        .eq('event_id', selectedEvent);

      if (deleteError) {
        toast({ title: "Erro ao atualizar escala", description: `Não foi possível limpar os responsáveis antigos. ${deleteError.message}`, variant: "destructive" });
        setIsSaving(false);
        return;
      }
    }
    
    const assignmentsToInsert = validAssignments.map(a => ({
      event_id: selectedEvent,
      user_id: a.user_id,
      role: a.role.trim(),
      status: 'pending'
    }));

    const { error: insertError } = await supabase.from('event_assignments').insert(assignmentsToInsert);

    if (insertError) {
      toast({ title: "Erro ao salvar escala", description: insertError.message, variant: "destructive" });
    } else {
      toast({ title: `Escala ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`, description: "Os responsáveis foram notificados." });
      
      const eventDetails = events.find(e => e.id.toString() === selectedEvent.toString());
      await createNotificationForAllUsers({
        title: `Escala ${isEditMode ? 'Atualizada' : 'Disponível'}!`,
        message: `Confira a escala para o evento "${eventDetails.title}".`,
        link: '/escalas'
      });

      navigate('/admin/gerenciar-escalas');
    }
    setIsSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Helmet><title>{pageTitle} - Eclésia App</title></Helmet>
      <div className="container mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center space-x-2 mb-6">
            {isEditMode ? <Edit className="h-8 w-8 text-primary" /> : <CalendarPlus className="h-8 w-8 text-primary" />}
            <div>
              <h1 className="text-3xl font-bold gradient-text">{pageTitle}</h1>
              <p className="text-muted-foreground">{isEditMode ? 'Modifique os responsáveis e suas funções.' : 'Associe responsáveis a um evento existente.'}</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Escala</CardTitle>
              <CardDescription>Selecione o evento e adicione os responsáveis e suas funções.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="evento">Evento</Label>
                <Select onValueChange={setSelectedEvent} value={selectedEvent} disabled={isEditMode}>
                  <SelectTrigger id="evento">
                    <SelectValue placeholder="Selecione um evento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title} - {new Date(event.event_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isEditMode && <p className="text-xs text-muted-foreground mt-2">Para alterar o evento, exclua esta escala e crie uma nova.</p>}
              </div>

              <div className="space-y-4">
                <Label>Responsáveis</Label>
                {assignments.map((assignment, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`user-${index}`} className="text-xs">Membro</Label>
                        <Select onValueChange={(value) => handleAssignmentChange(index, 'user_id', value)} value={assignment.user_id}>
                          <SelectTrigger id={`user-${index}`}>
                            <SelectValue placeholder="Selecione um membro..." />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>{user.name} {user.surname}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`role-${index}`} className="text-xs">Função</Label>
                        <Input
                          id={`role-${index}`}
                          placeholder="Ex: Louvor, Preletor"
                          value={assignment.role}
                          onChange={(e) => handleAssignmentChange(index, 'role', e.target.value)}
                        />
                      </div>
                    </div>
                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveAssignment(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddAssignment}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Responsável
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSaving} size="lg">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isEditMode ? 'Atualizar Escala' : 'Salvar Escala'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  );
};

export default CriarEscala;