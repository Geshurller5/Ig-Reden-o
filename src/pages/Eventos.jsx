import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { CalendarCheck, Loader2, MapPin, Car, TramFront, Navigation, Clock } from 'lucide-react';

const Eventos = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

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

  const generateMapLink = (provider, address) => {
    const encodedAddress = encodeURIComponent(address);
    switch (provider) {
      case 'google': return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      case 'waze': return `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;
      case 'uber': return `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodedAddress}`;
      default: return '#';
    }
  };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter(event => new Date(event.event_date) >= today);
  const pastEvents = events.filter(event => new Date(event.event_date) < today).sort((a, b) => new Date(b.event_date) - new Date(a.event_date));


  const renderEventCard = (event, index) => (
    <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        <CardHeader>
          <CardTitle className="text-xl">{event.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><CalendarCheck className="h-4 w-4" /><span>{new Date(event.event_date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
            <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>{event.event_time}</span></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          <p className="text-sm text-muted-foreground">{event.description || 'Nenhuma descrição adicional.'}</p>
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
      </Card>
    </motion.div>
  );

  return (
    <>
      <Helmet><title>Agenda de Eventos - Eclésia App</title></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center space-x-2">
            <CalendarCheck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Agenda de Eventos</h1>
              <p className="text-muted-foreground">Fique por dentro de toda a programação da igreja.</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : (
          <>
            <section>
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Próximos Eventos</h2>
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map(renderEventCard)}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum evento agendado. Fique de olho para novidades!</p>
              )}
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Eventos Passados</h2>
              {pastEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map(renderEventCard)}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum evento passado recente.</p>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
};

export default Eventos;