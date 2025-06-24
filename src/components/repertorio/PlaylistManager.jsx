import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ListMusic, FolderPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import CreatePlaylistDialog from './CreatePlaylistDialog';

const PlaylistManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatePlaylistOpen, setCreatePlaylistOpen] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('playlists')
      .select('*, playlist_songs(count)')
      .eq('user_id', user.id);
    if (error) {
      toast({ title: 'Erro ao buscar playlists', description: error.message, variant: 'destructive' });
    } else {
      setPlaylists(data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return (
    <>
      <CreatePlaylistDialog open={isCreatePlaylistOpen} onOpenChange={setCreatePlaylistOpen} onPlaylistCreated={fetchPlaylists} />
      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Minhas Playlists</CardTitle>
              <Button onClick={() => setCreatePlaylistOpen(true)}><FolderPlus className="mr-2 h-4 w-4" />Criar Nova Playlist</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : playlists.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Você ainda não tem nenhuma playlist.</p>
                <p className="text-sm">Crie uma para começar a organizar suas músicas!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlists.map(playlist => (
                  <motion.div key={playlist.id} whileHover={{ scale: 1.03 }} onClick={() => navigate(`/repertorio/playlists/${playlist.id}`)} className="cursor-pointer">
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ListMusic className="h-5 w-5 text-primary" />{playlist.name}</CardTitle>
                      </CardHeader>
                      <CardFooter>
                        <p className="text-sm text-muted-foreground">{playlist.playlist_songs[0]?.count || 0} / 100 músicas</p>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PlaylistManager;