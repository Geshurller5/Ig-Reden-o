import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Music, Search, ListMusic } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddToPlaylistDialog from '@/components/repertorio/AddToPlaylistDialog';
import AddToLiturgyDialog from '@/components/repertorio/AddToLiturgyDialog';
import SongSearch from '@/components/repertorio/SongSearch';
import PlaylistManager from '@/components/repertorio/PlaylistManager';

const Repertorio = () => {
  const { toast } = useToast();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
  const [isAddToLiturgyOpen, setAddToLiturgyOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('songs').select('*').order('title', { ascending: true });
    if (error) {
      toast({ title: 'Erro ao buscar repertório', description: error.message, variant: 'destructive' });
    } else {
      setSongs(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const handleAddToPlaylist = (song) => {
    setSelectedSong(song);
    setAddToPlaylistOpen(true);
  };
  
  const handleSendToLiturgy = (song) => {
    setSelectedSong(song);
    setAddToLiturgyOpen(true);
  };

  const handleClearRepertory = async () => {
    const { error } = await supabase.from('songs').delete().neq('id', 0);
    if (error) {
        toast({ title: 'Erro ao limpar repertório', description: error.message, variant: 'destructive' });
    } else {
        toast({ title: 'Repertório limpo!', description: 'Todas as músicas foram removidas.' });
        fetchSongs();
    }
  };

  return (
    <>
      <Helmet><title>Repertório - Eclésia App</title><meta name="description" content="Explore e gerencie o repertório de músicas e playlists da igreja." /></Helmet>
      
      {selectedSong && <AddToPlaylistDialog open={isAddToPlaylistOpen} onOpenChange={setAddToPlaylistOpen} song={selectedSong} />}
      {selectedSong && <AddToLiturgyDialog open={isAddToLiturgyOpen} onOpenChange={setAddToLiturgyOpen} song={selectedSong} />}

      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2"><Music className="h-8 w-8 text-primary" /><h1 className="text-3xl font-bold gradient-text">Repertório</h1></div>
          <p className="text-muted-foreground">Busque, adicione músicas e gerencie suas playlists.</p>
        </motion.div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search"><Search className="mr-2 h-4 w-4" />Buscar Músicas</TabsTrigger>
            <TabsTrigger value="playlists"><ListMusic className="mr-2 h-4 w-4" />Minhas Playlists</TabsTrigger>
          </TabsList>
          <TabsContent value="search">
            <SongSearch 
              songs={songs} 
              loading={loading} 
              onSongAdded={fetchSongs} 
              onAddToPlaylist={handleAddToPlaylist}
              onSendToLiturgy={handleSendToLiturgy}
              onClearRepertory={handleClearRepertory}
            />
          </TabsContent>
          <TabsContent value="playlists">
            <PlaylistManager />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Repertorio;