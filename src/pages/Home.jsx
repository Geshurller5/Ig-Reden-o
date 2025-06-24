import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, GraduationCap, Heart, Sparkles, Activity, Tv, CalendarDays, Music, ShoppingBasket as Sitemap, BookOpen as BookOpenIcon, Calendar, Users } from 'lucide-react';
import LiveStreamPlayer from '@/components/home/LiveStreamPlayer';
import { verses } from '@/data/verses';
import { supabase } from '@/lib/supabaseClient';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videoConfig, setVideoConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latestStudy, setLatestStudy] = useState(null);
  const [latestScale, setLatestScale] = useState(null);
  const [latestLiturgy, setLatestLiturgy] = useState(null);
  const [upcomingEvent, setUpcomingEvent] = useState(null);

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    
    const today = new Date().toISOString().split('T')[0];
    
    const [videoRes, studyRes, scaleRes, liturgyRes, eventRes] = await Promise.all([
      supabase.from('app_config').select('value').eq('key', 'video_player').limit(1),
      supabase.from('ebd_studies').select('title, theme').order('created_at', { ascending: false }).limit(1),
      supabase.from('events').select('title, event_date').order('event_date', { ascending: false }).limit(1),
      supabase.from('liturgies').select('title, liturgy_date').order('liturgy_date', { ascending: false }).limit(1),
      supabase.from('events').select('title, event_date, event_time').gte('event_date', today).order('event_date', { ascending: true }).limit(1)
    ]);

    if (videoRes.data?.[0]) setVideoConfig(videoRes.data[0].value);
    if (studyRes.data?.[0]) setLatestStudy(studyRes.data[0]);
    if (scaleRes.data?.[0]) setLatestScale(scaleRes.data[0]);
    if (liturgyRes.data?.[0]) setLatestLiturgy(liturgyRes.data[0]);
    if (eventRes.data?.[0]) setUpcomingEvent(eventRes.data[0]);
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);
  
  const getVerseOfDay = () => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return verses[dayOfYear % verses.length];
  };

  const verseOfDay = useMemo(getVerseOfDay, []);

  const quickAccess = [
    { title: "Mural de Avisos", path: "/mural", icon: MessageSquare },
    { title: "Bíblia Sagrada", path: "/biblia", icon: BookOpenIcon },
    { title: "Estudos da EBD", path: "/ebd", icon: GraduationCap },
    { title: "Ofertar", path: "/ofertar", icon: Heart },
    { title: "Escalas", path: "/escalas", icon: CalendarDays },
    { title: "Repertório", path: "/repertorio", icon: Music },
    { title: "Organograma", path: "/organograma", icon: Sitemap },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Home - Eclésia App</title>
        <meta name="description" content="Página inicial do Eclésia App com transmissão ao vivo, acesso rápido e eventos." />
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {getGreeting()}, {user?.name}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Que a paz do Senhor esteja com você hoje.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                  Versículo do Dia
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <blockquote className="text-amber-900 dark:text-amber-100 italic text-lg leading-relaxed mb-2">
                "{verseOfDay.text}"
              </blockquote>
              <cite className="text-amber-700 dark:text-amber-300 font-semibold">
                {verseOfDay.reference}
              </cite>
            </CardContent>
          </Card>
        </motion.div>
        
        {loading ? (
             <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
             </div>
        ) : (
        <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2">
                 <Activity className="h-6 w-6" />
                 <h2 className="text-2xl font-bold text-center">Fique por Dentro</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvent && (
                  <Card className="flex flex-col border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" /> 
                        Próximos Eventos
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {upcomingEvent.title} - {formatDate(upcomingEvent.event_date)}
                        {upcomingEvent.event_time && ` às ${upcomingEvent.event_time}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                      <Button onClick={() => navigate('/eventos')} className="w-full">Ver eventos</Button>
                    </CardContent>
                  </Card>
                )}
                {latestScale && (
                  <Card className="flex flex-col border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" /> 
                        Nova Escala Publicada
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {latestScale.title} - {formatDate(latestScale.event_date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                      <Button onClick={() => navigate('/escalas')} className="w-full">Ver escalas</Button>
                    </CardContent>
                  </Card>
                )}
                {latestStudy && (
                  <Card className="flex flex-col border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-purple-500" /> 
                        Última Lição da EBD
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{latestStudy.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                      <Button onClick={() => navigate('/ebd')} className="w-full">Ver lições</Button>
                    </CardContent>
                  </Card>
                )}
                {latestLiturgy && (
                  <Card className="flex flex-col border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpenIcon className="h-5 w-5 text-orange-500" /> 
                        Última Liturgia
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {latestLiturgy.title} - {formatDate(latestLiturgy.liturgy_date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                      <Button onClick={() => navigate('/liturgia')} className="w-full">Ver liturgia</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Tv className="h-6 w-6 text-red-500" />
                    Culto Ao Vivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveStreamPlayer config={videoConfig} />
                </CardContent>
              </Card>
            </motion.div>
        </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-center">Acesso Rápido</h2>
          <Card>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {quickAccess.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <li key={index}>
                      <a
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(item.path);
                        }}
                        className="flex items-center p-3 -m-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Icon className="h-6 w-6 mr-4 text-primary" />
                        <span className="font-medium">{item.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Home;