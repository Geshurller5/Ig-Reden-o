import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { User, Check, SkipBack, SkipForward, Loader2, FileText, Youtube, Mic2, Music, BookOpen, HeartHandshake as Handshake, Hand as HeartHand, Coins as HandCoins, Users, Home, Annoyed } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import LyricsModal from '@/components/modals/LyricsModal';
import { books } from '@/data/bible/books';

const stepIcons = {
  louvor: Music,
  leitura: BookOpen,
  oracao: Handshake,
  ofertório: HandCoins,
  intercessao: Users,
  comunhao: HeartHand,
  familia: Home,
  avisos: Annoyed,
  outro: User,
  musica: Music,
};

const Liturgia = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [liturgy, setLiturgy] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [lyricsModalOpen, setLyricsModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [defaultTab, setDefaultTab] = useState('letra');

  const fetchLiturgy = useCallback(async () => {
    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    let liturgyData = null;
    let queryError = null;

    const { data: nextLiturgy, error: nextError } = await supabase
      .from('liturgies')
      .select('*')
      .gte('liturgy_date', todayString)
      .order('liturgy_date', { ascending: true })
      .limit(1);

    if (nextError) {
      queryError = nextError;
    } else if (nextLiturgy && nextLiturgy.length > 0) {
      liturgyData = nextLiturgy[0];
    } else {
      const { data: pastLiturgy, error: pastError } = await supabase
        .from('liturgies')
        .select('*')
        .lt('liturgy_date', todayString)
        .order('liturgy_date', { ascending: false })
        .limit(1);
      
      if (pastError) {
        queryError = pastError;
      } else if (pastLiturgy && pastLiturgy.length > 0) {
        liturgyData = pastLiturgy[0];
      }
    }

    if (queryError) {
      toast({ title: 'Erro ao buscar liturgia', description: queryError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (liturgyData) {
      setLiturgy(liturgyData);
      const { data: stepsData, error: stepsError } = await supabase
        .from('liturgy_steps')
        .select('*, profiles(name, surname), songs(*)')
        .eq('liturgy_id', liturgyData.id)
        .order('step_order', { ascending: true });

      if (stepsError) {
        toast({ title: 'Erro ao buscar passos da liturgia', description: stepsError.message, variant: 'destructive' });
      } else {
        setSteps(stepsData.map(s => ({...s, content: s.content || {}})));
        setCurrentStep(0);
      }
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchLiturgy();
  }, [fetchLiturgy]);

  const handleStepClick = (index) => {
    setCurrentStep(index);
  };
  
  const openLink = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShowLyrics = (song, tab) => {
    setSelectedSong(song);
    setDefaultTab(tab);
    setLyricsModalOpen(true);
  };

  const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : (steps.length === 1 ? 100 : 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 text-center flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!liturgy) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold">Nenhuma liturgia encontrada.</h1>
        <p className="text-muted-foreground">Peça para um administrador cadastrar uma nova liturgia.</p>
      </div>
    );
  }

  const renderSongs = (songs) => (
    <div className="mt-4 pt-4 border-t border-dashed">
      <h4 className="font-semibold mb-2">Músicas:</h4>
      <div className="space-y-3">
        {songs.map(song => (
          <Card key={song.id} className="bg-background/50">
            <CardContent className="p-3">
              <p className="font-semibold">{song.title}</p>
              <p className="text-sm text-muted-foreground">{song.artist}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleShowLyrics(song, 'cifra'); }} disabled={!song.cifra_url}><FileText className="h-4 w-4 mr-1" />Cifra</Button>
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleShowLyrics(song, 'letra'); }} disabled={!song.lyrics}><Mic2 className="h-4 w-4 mr-1" />Letra</Button>
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openLink(song.youtube_url); }} disabled={!song.youtube_url}><Youtube className="h-4 w-4 mr-1" />YouTube</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
  
  return (
    <>
      <Helmet><title>Liturgia - {liturgy.title}</title></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h1 className="text-3xl font-bold gradient-text">{liturgy.title}</h1>
          <p className="text-muted-foreground">Acompanhe o andamento do culto em tempo real.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Progresso do Culto</span><span className="text-sm text-muted-foreground">{currentStep + 1} de {steps.length}</span></div>
              <div className="w-full bg-muted rounded-full h-2.5"><div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
              <div className="flex items-center justify-center space-x-4">
                <Button onClick={() => handleStepClick(Math.max(0, currentStep - 1))} variant="outline" disabled={currentStep === 0}><SkipBack className="h-4 w-4 mr-2" />Anterior</Button>
                <Button onClick={() => handleStepClick(Math.min(steps.length - 1, currentStep + 1))} disabled={currentStep >= steps.length - 1}><SkipForward className="h-4 w-4 mr-2" />Próxima</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
          <h2 className="text-xl font-bold">Programação Completa</h2>
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = stepIcons[step.type] || User;
              const isLeitura = step.type === 'leitura' && step.description;
              
              const handleLeituraClick = (e) => {
                if(isLeitura) {
                    e.stopPropagation();
                    const bookNameMatch = step.description.match(/^[1-3]?\s?[a-zA-Z\u00C0-\u017F]+/);
                    if (!bookNameMatch) return;
                    
                    const bookName = bookNameMatch[0];
                    const chapterVerse = step.description.substring(bookName.length).trim();

                    const book = books.find(b => b.name.toLowerCase() === bookName.toLowerCase());
                    
                    if(book && chapterVerse.includes(':')) {
                        const [chapter, verse] = chapterVerse.split(':');
                        navigate(`/biblia?book=${book.abbrev}&chapter=${chapter}&verse=${verse}`);
                    } else if (book) {
                        const [chapter] = chapterVerse.split(':');
                        navigate(`/biblia?book=${book.abbrev}&chapter=${chapter}`);
                    }
                }
              };
              
              return (
                <motion.div key={step.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.05 }}>
                  <Card onClick={() => handleStepClick(index)} className={`transition-all duration-300 cursor-pointer ${index === currentStep ? 'border-primary bg-primary/5 shadow-md' : 'hover:shadow-sm'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${index < currentStep ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                            {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold">{step.title}</h3>
                            {step.description && (
                                <p 
                                    className={`text-sm text-muted-foreground mt-1 ${isLeitura ? 'cursor-pointer hover:text-primary underline' : ''}`}
                                    onClick={handleLeituraClick}
                                >
                                    {step.description}
                                </p>
                            )}
                            {step.profiles && (
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                                <User className="h-3 w-3" /><span>{step.profiles.name} {step.profiles.surname}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1"><Icon className="h-3 w-3" /> {step.type}</Badge>
                      </div>
                      {index === currentStep && (
                        <>
                          {step.type === 'louvor' && (step.content?.songs || []).length > 0 && renderSongs(step.content.songs)}
                          {step.type === 'musica' && step.songs && renderSongs([step.songs])}
                          {step.type === 'ofertório' && (
                            <div className="mt-4 pt-4 border-t border-dashed text-center">
                              <Button onClick={(e) => { e.stopPropagation(); navigate('/ofertar'); }}>
                                <HandCoins className="mr-2 h-4 w-4" /> Ir para Ofertas
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
      {selectedSong && (
        <LyricsModal
          isOpen={lyricsModalOpen}
          onClose={() => setLyricsModalOpen(false)}
          song={selectedSong}
          defaultTab={defaultTab}
        />
      )}
    </>
  );
};

export default Liturgia;