import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { CalendarCheck, PlusCircle, Edit, Trash2, Loader2, MapPin, Building, Car, TramFront, Navigation, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createNotificationForAllUsers } from '@/lib/notificationUtils';

const GerenciarEventos = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) {
      toast({ title: "Erro ao buscar eventos", description: error.message, variant: "destructive" });
    } else {
      setEvents(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenChange = (open) => {
    if (open) {
      if (!currentEvent) {
        setCurrentEvent({ locationType: 'sede', address: '', title: '', description: '', event_date: '', event_time: '' });
      }
    } else {
      setCurrentEvent(null);
    }
    setIsModalOpen(open);
  };

  const handleEditClick = (event) => {
    const locationType = event.location?.startsWith('Igreja Sede') ? 'sede' : 'outro';
    const address = locationType === 'outro' ? event.location : '';
    setCurrentEvent({ ...event, locationType, address });
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!currentEvent.title || !currentEvent.event_date || !currentEvent.event_time) {
      toast({ title: "Campos obrigatórios", description: "Título, data e hora são necessários.", variant: "destructive" });
      return;
    }
    setIsSaving(true);

    const isNewEvent = !currentEvent.id;
    const location = currentEvent.locationType === 'sede' ? 'Igreja Sede' : currentEvent.address;

    const eventData = {
      id: currentEvent.id,
      title: currentEvent.title,
      description: currentEvent.description,
      event_date: currentEvent.event_date,
      event_time: currentEvent.event_time,
      location: location,
      type: currentEvent.type || 'geral',
    };

    const { error } = await supabase.from('events').upsert(eventData);

    if (error) {
      toast({ title: "Erro ao salvar evento", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Evento ${isNewEvent ? 'criado' : 'atualizado'} com sucesso!` });
      if (isNewEvent) {
        await createNotificationForAllUsers({
          title: 'Novo Evento na Agenda!',
          message: `Não perca: "${eventData.title}" no dia ${new Date(eventData.event_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.`,
          link: '/eventos'
        });
      }
      setIsModalOpen(false);
      setCurrentEvent(null);
      fetchEvents();
    }
    setIsSaving(false);
  };

  const handleDeleteEvent = async (eventId) => {
    const { error: assignmentError } = await supabase
      .from('event_assignments')
      .delete()
      .eq('event_id', eventId);

    if (assignmentError) {
      toast({ title: "Erro ao excluir escalas do evento", description: assignmentError.message, variant: "destructive" });
      return;
    }

    const { error: eventError } = await supabase.from('events').delete().eq('id', eventId);
    
    if (eventError) {
      toast({ title: "Erro ao excluir evento", description: eventError.message, variant: "destructive" });
    } else {
      toast({ title: "Evento excluído com sucesso!" });
      fetchEvents();
    }
  };

  const generateMapLink = (provider, address) => {
    const encodedAddress = encodeURIComponent(address);
    switch (provider) {
      case 'google': return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      case 'waze': return `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;
      case 'uber': return `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodedAddress}`;
      default: return '#';
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <Helmet><title>Gerenciar Eventos - Eclésia App</title></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <CalendarCheck className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold gradient-text">Gerenciar Eventos</h1>
                <p className="text-muted-foreground">Crie, edite e visualize todos os eventos da igreja.</p>
              </div>
            </div>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Evento</Button>
            </DialogTrigger>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : events.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <CalendarCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground">Crie um novo evento para começar a planejar.</p>
            <DialogTrigger asChild>
              <Button className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Criar Evento</Button>
            </DialogTrigger>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription>{new Date(event.event_date).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} às {event.event_time}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow">
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="flex items-start gap-2 pt-2">
                      <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold">{event.location}</p>
                        {event.location !== 'Igreja Sede' && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Button asChild size="sm" variant="outline"><a href={generateMapLink('google', event.location)} target="_blank" rel="noopener noreferrer"><Navigation className="h-4 w-4 mr-2" />Google Maps</a></Button>
                            <Button asChild size="sm" variant="outline"><a href={generateMapLink('waze', event.location)} target="_blank" rel="noopener noreferrer"><TramFront className="h-4 w-4 mr-2" />Waze</a></Button>
                            <Button asChild size="sm" variant="outline"><a href={generateMapLink('uber', event.location)} target="_blank" rel="noopener noreferrer"><Car className="h-4 w-4 mr-2" />Uber</a></Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2 bg-muted/50 p-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(event)}><Edit className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso excluirá permanentemente o evento e todas as suas escalas.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSaveEvent}>
          <DialogHeader>
            <DialogTitle>{currentEvent?.id ? 'Editar Evento' : 'Criar Novo Evento'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Evento</Label>
              <Input id="title" value={currentEvent?.title || ''} onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={currentEvent?.description || ''} onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={currentEvent?.event_date || ''} onChange={(e) => setCurrentEvent({ ...currentEvent, event_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input id="time" type="time" value={currentEvent?.event_time || ''} onChange={(e) => setCurrentEvent({ ...currentEvent, event_time: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Localização</Label>
              <RadioGroup value={currentEvent?.locationType || 'sede'} onValueChange={(value) => setCurrentEvent({ ...currentEvent, locationType: value })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sede" id="sede" />
                  <Label htmlFor="sede" className="flex items-center gap-2"><Building className="h-4 w-4" />Igreja Sede</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outro" id="outro" />
                  <Label htmlFor="outro" className="flex items-center gap-2"><MapPin className="h-4 w-4" />Outro Endereço</Label>
                </div>
              </RadioGroup>
              {currentEvent?.locationType === 'outro' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                  <Input placeholder="Digite o endereço completo" value={currentEvent?.address || ''} onChange={(e) => setCurrentEvent({ ...currentEvent, address: e.target.value })} />
                </motion.div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GerenciarEventos;