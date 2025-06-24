import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, ListMusic, Trash2, ArrowLeft, FileText, Youtube, MicOff as MicVocal } from 'lucide-react';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaylistDetails = useCallback(async () => {
    setLoading(true);
    const { data: playlistData, error: playlistError } = await supabase
      .from('playlists')
      .select('name')
      .eq('id', id)
      .single();

    if (playlistError || !playlistData) {
      toast({ title: 'Erro ao buscar playlist', description: playlistError?.message || 'Playlist não encontrada.', variant: 'destructive' });
      navigate('/repertorio');
      return;
    }
    setPlaylist(playlistData);

    const { data: songsData, error: songsError } = await supabase
      .from('playlist_songs')
      .select('songs(*)')
      .eq('playlist_id', id)
      .order('created_at', { ascending: false });

    if (songsError) {
      toast({ title: 'Erro ao buscar músicas da playlist', description: songsError.message, variant: 'destructive' });
    } else {
      setSongs(songsData.map(item => item.songs));
    }
    setLoading(false);
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [fetchPlaylistDetails]);

  const handleRemoveSong = async (songId) => {
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .match({ playlist_id: id, song_id: songId });

    if (error) {
      toast({ title: 'Erro ao remover música', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Música removida!', description: 'A música foi removida da sua playlist.' });
      fetchPlaylistDetails();
    }
  };
  
  const openLink = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Helmet>
        <title>{playlist?.name || 'Playlist'} - Eclésia App</title>
        <meta name="description" content={`Detalhes da playlist ${playlist?.name}.`} />
      </Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => navigate('/repertorio')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Repertório
          </Button>
          <div className="flex items-center space-x-3">
            <ListMusic className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">{playlist.name}</h1>
              <p className="text-muted-foreground">{songs.length} / 100 músicas</p>
            </div>
          </div>
        </motion.div>

        {songs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-lg text-muted-foreground">Esta playlist está vazia.</p>
            <Button onClick={() => navigate('/repertorio')} className="mt-4">Adicionar Músicas</Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {songs.map((song, index) => (
              <motion.div key={song.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>{song.title}</CardTitle>
                    <CardDescription>{song.artist}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                     <div className="grid grid-cols-3 gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => openLink(song.youtube_url)} disabled={!song.youtube_url}><Youtube className="h-4 w-4 mr-2" />YouTube</Button>
                        <Button size="sm" variant="outline" onClick={() => openLink(song.cifra_url)} disabled={!song.cifra_url}><FileText className="h-4 w-4 mr-2" />Cifra</Button>
                        <Button size="sm" variant="outline" onClick={() => openLink(song.lyrics)} disabled={!song.lyrics}><MicVocal className="h-4 w-4 mr-2" />Letra</Button>
                      </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full"><Trash2 className="mr-2 h-4 w-4" /> Remover</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover música?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Você tem certeza que deseja remover "{song.title}" desta playlist?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveSong(song.id)}>Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PlaylistDetail;