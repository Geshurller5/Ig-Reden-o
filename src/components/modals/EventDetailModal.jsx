import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, CheckCircle, Info, User, ExternalLink, Link as LinkIcon, CalendarPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { generateGoogleCalendarLink } from '@/lib/calendarUtils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const EventDetailModal = ({ isOpen, onClose, event, isAssigned }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isAddedToCalendar, setIsAddedToCalendar] = useState(false);

  useEffect(() => {
    if (event && user && isAssigned) {
      const checkConfirmation = async () => {
        const { data } = await supabase
          .from('event_assignments')
          .select('status')
          .eq('event_id', event.id)
          .eq('user_id', user.id)
          .single();
        if (data) {
          setIsConfirmed(data.status === 'confirmed');
        }
      };
      checkConfirmation();
    }
  }, [event, user, isAssigned]);

  if (!event) return null;

  const handleConfirmPresence = async () => {
    const { error } = await supabase
      .from('event_assignments')
      .update({ status: 'confirmed' })
      .eq('event_id', event.id)
      .eq('user_id', user.id);

    if (!error) {
      setIsConfirmed(true);
      toast({
        title: "Presença Confirmada!",
        description: "Obrigado! Sua presença foi registrada com sucesso.",
        action: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
    } else {
      toast({
        title: "Erro ao confirmar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddToCalendar = () => {
    const link = generateGoogleCalendarLink({
      title: event.title,
      date: event.event_date,
      time: event.event_time,
      description: event.description,
      location: event.location
    });
    if(link) {
      window.open(link, '_blank');
      setIsAddedToCalendar(true);
      toast({ title: "Agenda", description: "Evento enviado para o Google Calendar." });
    } else {
      toast({ title: "Erro", description: "Não foi possível gerar o link do evento.", variant: "destructive" });
    }
  };

  const handleRelatedPost = () => {
    const pathMap = {
      'new-scale': '/escalas',
      'new-liturgy': '/liturgia',
      'new-study': '/ebd'
    };
    const path = pathMap[event.type] || '/';
    navigate(path);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Info className="h-6 w-6 text-primary" />
            Detalhes do Evento
          </DialogTitle>
          <DialogDescription className="text-lg pt-1">
            {event.title}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <p><span className="font-semibold">Data:</span> {new Date(event.event_date + 'T00:00:00-03:00').toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p>
          </div>
          {event.event_time && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <p><span className="font-semibold">Hora:</span> {event.event_time} (Horário de Brasília)</p>
            </div>
          )}
          <div>
            <p className="font-semibold mb-1">Descrição:</p>
            <p className="text-muted-foreground text-sm">{event.description}</p>
          </div>
        </div>
        <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={handleAddToCalendar} disabled={isAddedToCalendar}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              {isAddedToCalendar ? 'Adicionado à Agenda' : 'Adicionar à Agenda'}
              {isAddedToCalendar && <CheckCircle className="ml-auto h-4 w-4 text-green-500" />}
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleRelatedPost}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Ver postagem relacionada
              <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
            </Button>
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          {isAssigned && (
            <div className="relative">
              <AnimatePresence>
                {isConfirmed && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 bg-green-500 text-white rounded-md flex items-center justify-center"
                  >
                    <CheckCircle className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Button onClick={handleConfirmPresence} disabled={isConfirmed} className="w-full">
                {isConfirmed ? 'Presença Confirmada' : 'Confirmar Presença'}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal;