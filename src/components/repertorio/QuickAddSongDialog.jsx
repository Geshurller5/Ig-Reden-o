import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Music } from 'lucide-react';

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const QuickAddSongDialog = ({ open, onOpenChange, onSongAdded }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ title: '', artist: '', youtube_url: '' });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const resetForm = () => {
    setFormData({ title: '', artist: '', youtube_url: '' });
    setSuggestions([]);
  };
  
  const handleSelectSuggestion = (suggestion) => {
    setFormData(prev => ({ ...prev, title: suggestion.title, artist: suggestion.artist }));
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.artist) {
      toast({ title: 'Campos obrigatórios', description: 'Título e artista são necessários.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const artistSlug = slugify(formData.artist);
    const titleSlug = slugify(formData.title);

    const cifraUrl = `https://www.cifraclub.com.br/${artistSlug}/${titleSlug}/`;
    const lyricsUrl = `https://www.letras.com/${artistSlug}/${titleSlug}/`;

    const { error } = await supabase.from('songs').insert([
      {
        title: formData.title,
        artist: formData.artist,
        youtube_url: formData.youtube_url || null,
        cifra_url: cifraUrl,
        lyrics: lyricsUrl, 
        ministry: 'Louvor',
      },
    ]);

    setLoading(false);

    if (error) {
      toast({ title: 'Erro ao adicionar música', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Música adicionada!', description: `"${formData.title}" foi adicionada ao repertório.` });
      resetForm();
      onSongAdded();
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (formData.title.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    const debounce = setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('song-suggester', {
          body: JSON.stringify({ query: formData.title }),
        });

        if (error) throw error;
        
        setSuggestions(data || []);
      } catch (error) {
        console.error('Error fetching song suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); 

    return () => clearTimeout(debounce);
  }, [formData.title]);


  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Música Rápida</DialogTitle>
          <DialogDescription>
            Digite o nome da música para ver sugestões. Cifra e letra serão geradas automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2 relative">
            <Label htmlFor="title">Título da Música</Label>
            <Input 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={(e) => setFormData(p => ({...p, title: e.target.value}))}
              required 
              autoComplete="off"
            />
            {isSearching && <Loader2 className="animate-spin h-4 w-4 absolute right-3 top-[34px] text-muted-foreground" />}
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-background border rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <div 
                    key={i} 
                    className="p-2 hover:bg-muted cursor-pointer flex items-center gap-3"
                    onClick={() => handleSelectSuggestion(s)}
                  >
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist">Artista / Ministério</Label>
            <Input 
              id="artist" 
              name="artist" 
              value={formData.artist} 
              onChange={(e) => setFormData(p => ({...p, artist: e.target.value}))}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube_url">Link do Vídeo (YouTube, etc.)</Label>
            <Input 
              id="youtube_url" 
              name="youtube_url" 
              value={formData.youtube_url} 
              onChange={(e) => setFormData(p => ({...p, youtube_url: e.target.value}))}
              placeholder="Opcional" 
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Música'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddSongDialog;