import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ListMusic, Plus } from 'lucide-react';

const AddToPlaylistDialog = ({ open, onOpenChange, song }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaylists = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('playlists')
      .select('id, name, playlist_songs(count)')
      .eq('user_id', user.id);
    
    if (error) {
      toast({ title: 'Erro ao buscar playlists', description: error.message, variant: 'destructive' });
    } else {
      setPlaylists(data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (open) {
      fetchPlaylists();
    }
  }, [open, fetchPlaylists]);

  const handleAddToPlaylist = async (playlist) => {
    if (playlist.playlist_songs[0].count >= 100) {
      toast({ title: 'Playlist cheia!', description: 'Esta playlist já atingiu o limite de 100 músicas.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('playlist_songs').insert([{ playlist_id: playlist.id, song_id: song.id }]);

    if (error) {
      if (error.code === '23505') { // unique_violation
        toast({ title: 'Música já na playlist', description: `"${song.title}" já está na playlist "${playlist.name}".`, variant: 'default' });
      } else {
        toast({ title: 'Erro ao adicionar música', description: error.message, variant: 'destructive' });
      }
    } else {
      toast({ title: 'Música adicionada!', description: `"${song.title}" foi adicionada à playlist "${playlist.name}".` });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar "{song.title}" à Playlist</DialogTitle>
          <DialogDescription>
            Selecione uma das suas playlists para adicionar esta música.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : playlists.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhuma playlist encontrada.</p>
          ) : (
            playlists.map(playlist => (
              <Button
                key={playlist.id}
                variant="ghost"
                className="w-full justify-start h-auto py-3"
                onClick={() => handleAddToPlaylist(playlist)}
              >
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <ListMusic className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{playlist.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{playlist.playlist_songs[0].count}/100</span>
                </div>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylistDialog;