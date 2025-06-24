import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, BookOpen, GraduationCap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const eventIcons = {
  'new-scale': { 
    icon: CalendarPlus, 
    title: "Nova Escala Publicada", 
    color: "text-blue-500" 
  },
  'new-liturgy': { 
    icon: BookOpen, 
    title: "Nova Liturgia Disponível", 
    color: "text-green-500" 
  },
  'new-study': { 
    icon: GraduationCap, 
    title: "Novo Estudo da EBD", 
    color: "text-purple-500" 
  },
};

const EventItem = ({ event, index, onEventClick }) => {
  const eventConfig = eventIcons[event.type];
  if (!eventConfig) return null;

  const { icon: Icon, title, color } = eventConfig;

  const handleButtonClick = () => {
    onEventClick(event);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Icon className={`h-6 w-6 ${color}`} />
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">{event.details.title}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto">
            <p className="text-xs text-muted-foreground min-w-max">
              {formatDistanceToNow(event.timestamp, { addSuffix: true, locale: ptBR })}
            </p>
            <Button onClick={handleButtonClick} size="sm" className="w-full sm:w-auto">
              Ver Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const EventFeed = ({ events, onEventClick }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Nenhuma atividade recente.</p>
        <p className="text-sm">As novidades da igreja aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <EventItem key={event.id} event={event} index={index} onEventClick={onEventClick} />
      ))}
    </div>
  );
};

export default EventFeed;