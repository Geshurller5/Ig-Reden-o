import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Music, PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabaseClient';
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

const GerenciarRepertorio = () => {
  const { toast } = useToast();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [filterTerm, setFilterTerm] = useState('');

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

  const handleOpenForm = (song = null) => {
    setEditingSong(song);
    setFormOpen(true);
  };

  const handleDeleteSong = async (songId) => {
    const { error } = await supabase.from('songs').delete().eq('id', songId);
    if (error) {
      toast({ title: 'Erro ao excluir música', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Música excluída com sucesso!' });
      fetchSongs();
    }
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

  const SongForm = ({ song, onFinished }) => {
    const [formData, setFormData] = useState({
      title: song?.title || '',
      artist: song?.artist || '',
      song_key: song?.song_key || '',
      ministry: song?.ministry || 'Louvor',
      youtube_url: song?.youtube_url || '',
      cifra_url: song?.cifra_url || '',
      lyrics: song?.lyrics || '',
    });
    const [isSubmitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      const upsertData = { ...formData };
      if (song) {
        upsertData.id = song.id;
      }

      const { error } = await supabase.from('songs').upsert(upsertData);

      if (error) {
        toast({ title: 'Erro ao salvar música', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: `Música ${song ? 'atualizada' : 'adicionada'} com sucesso!` });
        onFinished();
      }
      setSubmitting(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Título" required />
        <Input name="artist" value={formData.artist} onChange={handleChange} placeholder="Artista" required />
        <Input name="song_key" value={formData.song_key} onChange={handleChange} placeholder="Tom" />
        <Input name="ministry" value={formData.ministry} onChange={handleChange} placeholder="Ministério" />
        <Input name="youtube_url" value={formData.youtube_url} onChange={handleChange} placeholder="URL do YouTube" />
        <Input name="cifra_url" value={formData.cifra_url} onChange={handleChange} placeholder="URL da Cifra" />
        <Input name="lyrics" value={formData.lyrics} onChange={handleChange} placeholder="URL da Letra" />
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Salvar'}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(filterTerm.toLowerCase())
  );

  return (
    <>
      <Helmet><title>Gerenciar Repertório - Eclésia App</title></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Gerenciar Repertório</h1>
              <p className="text-muted-foreground">Cadastre, edite e organize as músicas da igreja.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Música</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Limpar Repertório
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente TODAS as músicas do repertório.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearRepertory} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Sim, limpar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>

        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSong ? 'Editar Música' : 'Adicionar Nova Música'}</DialogTitle>
            </DialogHeader>
            <SongForm song={editingSong} onFinished={() => { setFormOpen(false); fetchSongs(); }} />
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <Input
              placeholder="Filtrar por título ou artista..."
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="p-4 text-left font-semibold">Título</th>
                      <th className="p-4 text-left font-semibold hidden sm:table-cell">Artista</th>
                      <th className="p-4 text-left font-semibold hidden md:table-cell">Tom</th>
                      <th className="p-4 text-right font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSongs.map(song => (
                      <tr key={song.id} className="border-b last:border-none hover:bg-muted/50">
                        <td className="p-4 font-medium">{song.title}</td>
                        <td className="p-4 text-muted-foreground hidden sm:table-cell">{song.artist}</td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">{song.song_key || '-'}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenForm(song)}><Edit className="h-4 w-4" /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a música "{song.title}"?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteSong(song.id)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GerenciarRepertorio;