import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Search, Loader2, PlusCircle, Trash2, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { slugify } from '@/lib/repertorioUtils';
import SongCard from './SongCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SongSearch = ({ songs, loading, onSongAdded, onAddToPlaylist, onSendToLiturgy, onClearRepertory }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [artistName, setArtistName] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [filterTerm, setFilterTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  const canAddSongs = user && ['admin', 'pastor', 'Lider do Louvor', 'Membro do Louvor'].includes(user.role);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('repertorioSearchHistory');
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse search history from localStorage", error);
      localStorage.removeItem('repertorioSearchHistory');
    }
  }, []);

  const saveSearchTerm = useCallback((term) => {
    if (!term || term.trim() === '') return;
    const trimmedTerm = term.trim();
    setSearchHistory(prevHistory => {
      const newHistoryEntry = { term: trimmedTerm, date: new Date().toISOString() };
      const filteredHistory = prevHistory.filter(item => item.term.toLowerCase() !== trimmedTerm.toLowerCase());
      const updatedHistory = [newHistoryEntry, ...filteredHistory].slice(0, 10);
      localStorage.setItem('repertorioSearchHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);

  const handleHistoryClick = (term) => {
    setFilterTerm(term);
    saveSearchTerm(term);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('repertorioSearchHistory');
    setSearchHistory([]);
    toast({ title: 'Histórico de pesquisa limpo!', description: 'Suas buscas recentes foram removidas.' });
  };

  const handleAddNewSong = async (e) => {
    e.preventDefault();
    if (!artistName.trim() || !songTitle.trim()) {
      toast({ title: 'Campos obrigatórios', description: 'Por favor, preencha o nome do artista e da música.', variant: 'destructive' });
      return;
    }
    setIsAdding(true);
    const trimmedTitle = songTitle.trim();
    const trimmedArtist = artistName.trim();
    const { data: existingSong } = await supabase.from('songs').select('id').eq('title', trimmedTitle).eq('artist', trimmedArtist).maybeSingle();
    if (existingSong) {
      toast({ title: 'Música já existe!', description: `"${trimmedTitle}" já está no repertório.` });
      setIsAdding(false);
      return;
    }
    const artistSlug = slugify(trimmedArtist);
    const titleSlug = slugify(trimmedTitle);
    const newSong = {
      title: trimmedTitle,
      artist: trimmedArtist,
      cifra_url: `https://www.cifraclub.com.br/${artistSlug}/${titleSlug}/`,
      lyrics: `https://www.letras.mus.br/${artistSlug}/${titleSlug}/`,
      ministry: 'Louvor',
    };
    const { error } = await supabase.from('songs').insert([newSong]);
    if (error) {
      toast({ title: 'Erro ao adicionar música', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Música adicionada!', description: `"${trimmedTitle}" foi adicionada ao repertório.` });
      setArtistName('');
      setSongTitle('');
      onSongAdded();
    }
    setIsAdding(false);
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(filterTerm.toLowerCase())
  );

  return (
    <div className="mt-6 space-y-6">
      {canAddSongs && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Música</CardTitle>
            <CardDescription>Preencha o artista e o título para adicionar uma música e gerar os links automaticamente.</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddNewSong}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="artist-name">Artista</Label>
                <Input id="artist-name" placeholder="Ex: Ministério Morada" value={artistName} onChange={(e) => setArtistName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="song-title">Título da Música</Label>
                <Input id="song-title" placeholder="Ex: É Tudo Sobre Você" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isAdding} className="w-full">
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Adicionar ao Repertório
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filtrar repertório por título ou artista..." value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)} onBlur={(e) => saveSearchTerm(e.target.value)} className="pl-10" />
        </div>
        {user?.role === 'admin' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Limpar Tudo</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>Esta ação não pode ser desfeita. Isso excluirá permanentemente todo o repertório de músicas do banco de dados.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onClearRepertory} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Sim, limpar repertório</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {searchHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border rounded-lg bg-muted/50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" />Pesquisas Recentes</h4>
            <Button variant="link" size="sm" className="h-auto p-0 text-destructive hover:text-destructive/80" onClick={handleClearHistory}>Limpar histórico</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item, index) => (
              <Button key={index} variant="secondary" size="sm" onClick={() => handleHistoryClick(item.term)} className="h-auto px-3 py-1 text-xs">{item.term}</Button>
            ))}
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} onAddToPlaylist={onAddToPlaylist} onSendToLiturgy={onSendToLiturgy} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SongSearch;