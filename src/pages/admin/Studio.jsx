import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Clapperboard, Save, Link as LinkIcon, Youtube } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const AdminStudio = () => {
  const { toast } = useToast();
  const [liveUrl, setLiveUrl] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [playerType, setPlayerType] = useState('url'); // 'url' or 'iframe'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'video_player')
        .single();
      
      if (data?.value) {
        setLiveUrl(data.value.liveUrl || '');
        setFallbackUrl(data.value.fallbackUrl || '');
        setPlayerType(data.value.playerType || 'url');
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    const urlToUse = playerType === 'iframe' ? liveUrl : (liveUrl || fallbackUrl);
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    const iframeRegex = /<iframe.*src="https?:\/\/www\.youtube\.com\/embed\/.*".*><\/iframe>/;

    if (playerType === 'url' && urlToUse && !youtubeRegex.test(urlToUse)) {
      toast({ title: "URL inválida", description: "O link do YouTube parece inválido.", variant: "destructive" });
      return;
    }
    
    if (playerType === 'iframe' && urlToUse && !iframeRegex.test(urlToUse)) {
      toast({ title: "Código Iframe inválido", description: "O código de incorporação do YouTube parece inválido.", variant: "destructive" });
      return;
    }

    const config = { liveUrl, fallbackUrl, playerType };
    const { error } = await supabase
      .from('app_config')
      .update({ value: config })
      .eq('key', 'video_player');

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Configurações Salvas!",
        description: "O player de vídeo da página inicial foi atualizado.",
        action: <Save className="h-5 w-5 text-green-500" />
      });
    }
  };

  return (
    <>
      <Helmet><title>Estúdio - Eclésia App</title></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center space-x-3">
            <Clapperboard className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Estúdio de Transmissão</h1>
              <p className="text-muted-foreground">Gerencie o player de vídeo da página inicial.</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Player</CardTitle>
              <CardDescription>Insira os links do YouTube para a transmissão ao vivo e para o vídeo alternativo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tipo do Player</Label>
                <RadioGroup defaultValue={playerType} onValueChange={setPlayerType} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="url" id="url" />
                        <Label htmlFor="url">Link do YouTube</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="iframe" id="iframe" />
                        <Label htmlFor="iframe">Código de Incorporação (Iframe)</Label>
                    </div>
                </RadioGroup>
              </div>

              {playerType === 'url' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="live-url" className="flex items-center gap-2"><Youtube className="h-5 w-5 text-red-500" /> Link da transmissão ao vivo</Label>
                    <Input id="live-url" placeholder="https://www.youtube.com/watch?v=..." value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
                    <p className="text-sm text-muted-foreground">Este vídeo será exibido quando houver uma live ativa.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fallback-url" className="flex items-center gap-2"><LinkIcon className="h-5 w-5" /> Vídeo alternativo (on-demand)</Label>
                    <Input id="fallback-url" placeholder="https://www.youtube.com/watch?v=... ou link da playlist" value={fallbackUrl} onChange={(e) => setFallbackUrl(e.target.value)} />
                    <p className="text-sm text-muted-foreground">Este vídeo será exibido quando não houver live.</p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                    <Label htmlFor="iframe-code" className="flex items-center gap-2"><Youtube className="h-5 w-5 text-red-500" /> Código de incorporação (iframe)</Label>
                    <Textarea id="iframe-code" placeholder='<iframe width="..." height="..." src="..." ...></iframe>' value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} rows={4} />
                    <p className="text-sm text-muted-foreground">Cole o código de incorporação completo do YouTube aqui. Ele será usado para a live ou vídeo principal.</p>
                </div>
              )}
              
              <Button onClick={handleSave} className="w-full sm:w-auto" disabled={loading}>
                <Save className="mr-2 h-4 w-4" /> {loading ? 'Carregando...' : 'Atualizar Player'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AdminStudio;