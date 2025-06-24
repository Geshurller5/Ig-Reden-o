import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Palette, Copy, Trash2, X, Loader2 } from 'lucide-react';
import { books as bibleBooks } from '@/data/bible/books';

const highlightColors = [
  { name: 'Amarelo', color: '#fef08a', textColor: '#000000' },
  { name: 'Verde', color: '#bbf7d0', textColor: '#000000' },
  { name: 'Azul', color: '#bfdbfe', textColor: '#000000' },
  { name: 'Rosa', color: '#fbcfe8', textColor: '#000000' },
  { name: 'Laranja', color: '#fed7aa', textColor: '#000000' },
];

const getContrastingTextColor = (hexColor) => {
  if (!hexColor) return 'inherit';
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#1c1917' : '#fafaf9';
};

const Biblia = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const verseRefs = useRef({});

  const [selectedBook, setSelectedBook] = useState('gen');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [highlightedVerses, setHighlightedVerses] = useState({});
  const [selectedVerses, setSelectedVerses] = useState([]);

  const currentBook = useMemo(() => bibleBooks.find(b => b.abbrev === selectedBook), [selectedBook]);

  const loadChapter = useCallback(async () => {
    if (!currentBook) return;
    setLoading(true);
    setVerses([]);
    try {
      const bookNameForAPI = encodeURIComponent(currentBook.englishName);
      const response = await fetch(`https://bible-api.com/${bookNameForAPI}+${selectedChapter}?translation=almeida`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao carregar o capítulo.');
      }
      const data = await response.json();
      setVerses(data.verses.map(v => v.text));
    } catch (error) {
      toast({
        title: 'Erro ao buscar dados da Bíblia',
        description: error.message,
        variant: 'destructive',
      });
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBook, selectedChapter, currentBook, toast]);
  
  useEffect(() => {
    const savedHighlights = localStorage.getItem('bibleHighlights');
    if (savedHighlights) {
      setHighlightedVerses(JSON.parse(savedHighlights));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookParam = params.get('book');
    const chapterParam = params.get('chapter');
    const verseParam = params.get('verse');

    if (bookParam && chapterParam) {
      setSelectedBook(bookParam);
      setSelectedChapter(parseInt(chapterParam, 10));
    }
    
    if (verseParam && verses.length > 0) {
      const verseId = `${bookParam}-${chapterParam}-${verseParam}`;
      const element = verseRefs.current[verseId];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('animate-pulse-quick');
        setTimeout(() => element.classList.remove('animate-pulse-quick'), 2000);
      }
    }
  }, [location.search, verses]);

  useEffect(() => {
    loadChapter();
    setSelectedVerses([]);
  }, [selectedBook, selectedChapter, loadChapter]);

  const handleBookChange = (value) => {
    setSelectedBook(value);
    setSelectedChapter(1);
    navigate(`/biblia?book=${value}&chapter=1`);
  };
  
  const handleChapterChange = (value) => {
    setSelectedChapter(parseInt(value, 10));
    navigate(`/biblia?book=${selectedBook}&chapter=${value}`);
  };

  const handleVerseClick = (verseNumber) => {
    const verseId = `${selectedBook}-${selectedChapter}-${verseNumber}`;
    setSelectedVerses(prev => 
      prev.includes(verseId) 
        ? prev.filter(id => id !== verseId) 
        : [...prev, verseId]
    );
  };
  
  const saveHighlights = (newHighlights) => {
      localStorage.setItem('bibleHighlights', JSON.stringify(newHighlights));
      toast({ title: 'Marcações salvas!' });
  }

  const handleHighlight = (color) => {
    const newHighlights = { ...highlightedVerses };
    selectedVerses.forEach(id => {
      newHighlights[id] = color;
    });
    setHighlightedVerses(newHighlights);
    saveHighlights(newHighlights);
    setSelectedVerses([]);
  };

  const handleRemoveHighlight = () => {
    const newHighlights = { ...highlightedVerses };
    selectedVerses.forEach(id => {
      delete newHighlights[id];
    });
    setHighlightedVerses(newHighlights);
    saveHighlights(newHighlights);
    setSelectedVerses([]);
  };
  
  const getFormattedReference = (versesToFormat) => {
    if (versesToFormat.length === 0) return "";
    
    const firstVerseId = versesToFormat[0].split('-');
    const bookName = bibleBooks.find(b => b.abbrev === firstVerseId[0])?.name;
    const chapter = firstVerseId[1];
    
    const verseNumbers = versesToFormat.map(v => parseInt(v.split('-')[2])).sort((a,b) => a-b);
    const lastVerse = verseNumbers[verseNumbers.length - 1];
    
    return versesToFormat.length > 1
      ? `${bookName} ${chapter}:${verseNumbers[0]}-${lastVerse}`
      : `${bookName} ${chapter}:${verseNumbers[0]}`;
  };

  const handleSendToLiturgy = () => {
    const reference = getFormattedReference(selectedVerses);
    navigator.clipboard.writeText(reference);
    toast({
      title: 'Referência copiada!',
      description: `${reference} foi copiado para sua área de transferência.`,
    });
    setSelectedVerses([]);
  };

  return (
    <>
      <Helmet>
        <title>Bíblia - Eclésia App</title>
        <meta name="description" content="Leia a Bíblia Sagrada online com funcionalidades de marcação, favoritos e compartilhamento." />
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold gradient-text">Bíblia Sagrada</h1>
            </div>
            <p className="text-muted-foreground">Almeida Corrigida Fiel (ACF)</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedBook} onValueChange={handleBookChange}>
                <SelectTrigger><SelectValue placeholder="Selecione o Livro" /></SelectTrigger>
                <SelectContent>
                  {bibleBooks.map((book) => (
                    <SelectItem key={book.abbrev} value={book.abbrev}>{book.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentBook && (
                <Select value={String(selectedChapter)} onValueChange={handleChapterChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione o Capítulo" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: currentBook.chapters }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{currentBook?.name} {selectedChapter}</CardTitle>
              <CardDescription>{loading ? 'Carregando...' : `${verses.length} versículos`}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-1 text-lg leading-relaxed">
                  {verses.map((verse, index) => {
                    const verseId = `${selectedBook}-${selectedChapter}-${index + 1}`;
                    const highlightColor = highlightedVerses[verseId];
                    const isSelected = selectedVerses.includes(verseId);
                    const textColor = getContrastingTextColor(highlightColor);
                    return (
                        <p 
                            key={verseId}
                            ref={el => verseRefs.current[verseId] = el}
                            onClick={() => handleVerseClick(index + 1)}
                            className={`p-2 rounded-md cursor-pointer transition-colors duration-200 ${isSelected ? 'bg-primary/20' : ''}`}
                            style={{ 
                                backgroundColor: !isSelected && highlightColor ? highlightColor : undefined,
                                color: !isSelected && highlightColor ? textColor : 'inherit'
                            }}
                        >
                            <span className="text-primary font-bold mr-2">{index + 1}</span>
                            {verse}
                        </p>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedVerses.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 inset-x-4 z-50 flex justify-center"
          >
            <div className="w-full max-w-md">
                <Card className="shadow-2xl bg-background/80 backdrop-blur-sm">
                    <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">{selectedVerses.length} versículo(s) selecionado(s)</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedVerses([])}><X className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
                            {highlightColors.map(c => (
                                <Button key={c.color} onClick={() => handleHighlight(c.color)} variant="outline" size="icon" className="h-7 w-7">
                                    <div className="w-4 h-4 rounded-full border" style={{backgroundColor: c.color}}></div>
                                </Button>
                            ))}
                            <Button onClick={handleRemoveHighlight} variant="outline" size="icon" className="h-7 w-7"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                          <Button onClick={handleSendToLiturgy} variant="outline" size="sm"><Copy className="h-4 w-4 mr-2" /> Liturgia</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Biblia;