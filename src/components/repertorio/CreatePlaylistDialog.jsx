import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const CreatePlaylistDialog = ({ open, onOpenChange, onPlaylistCreated }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Nome inválido', description: 'O nome da playlist não pode ser vazio.', variant: 'destructive' });
      return;
    }
    if (!user) {
      toast({ title: 'Erro de autenticação', description: 'Você precisa estar logado para criar uma playlist.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('playlists').insert([{ name, user_id: user.id }]);
    setLoading(false);

    if (error) {
      toast({ title: 'Erro ao criar playlist', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Playlist criada!', description: `A playlist "${name}" foi criada com sucesso.` });
      setName('');
      onPlaylistCreated();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Playlist</DialogTitle>
          <DialogDescription>
            Dê um nome para sua nova playlist de músicas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="name" className="sr-only">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Louvores de Domingo"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Playlist'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlaylistDialog;