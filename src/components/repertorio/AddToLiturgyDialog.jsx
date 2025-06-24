import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AddToLiturgyDialog = ({ open, onOpenChange, song }) => {
  const { toast } = useToast();
  const [liturgies, setLiturgies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiturgies = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('liturgies')
      .select('*')
      .gte('liturgy_date', today)
      .order('liturgy_date', { ascending: true });
    
    if (error) {
      toast({ title: 'Erro ao buscar liturgias', description: error.message, variant: 'destructive' });
    } else {
      setLiturgies(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    if (open) {
      fetchLiturgies();
    }
  }, [open, fetchLiturgies]);

  const handleAddToLiturgy = async (liturgy) => {
    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from('liturgy_steps')
      .select('step_order')
      .eq('liturgy_id', liturgy.id)
      .order('step_order', { ascending: false })
      .limit(1)
      .single();

    if (maxOrderError && maxOrderError.code !== 'PGRST116') {
      toast({ title: 'Erro ao preparar música', description: maxOrderError.message, variant: 'destructive' });
      return;
    }

    const newOrder = maxOrderData ? maxOrderData.step_order + 1 : 1;

    const { error: insertError } = await supabase.from('liturgy_steps').insert([{ 
      liturgy_id: liturgy.id, 
      song_id: song.id,
      title: song.title,
      responsible: song.artist || 'Ministério de Louvor',
      type: 'musica',
      step_order: newOrder
    }]);

    if (insertError) {
      toast({ title: 'Erro ao adicionar música à liturgia', description: insertError.message, variant: 'destructive' });
    } else {
      toast({ title: 'Música enviada!', description: `"${song.title}" foi adicionada à liturgia "${liturgy.title}".` });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar "{song.title}" para Liturgia</DialogTitle>
          <DialogDescription>
            Selecione uma liturgia futura para adicionar esta música.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : liturgies.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhuma liturgia futura encontrada. Peça para um administrador criar uma.</p>
          ) : (
            liturgies.map(liturgy => (
              <Button
                key={liturgy.id}
                variant="ghost"
                className="w-full justify-start h-auto py-3"
                onClick={() => handleAddToLiturgy(liturgy)}
              >
                <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div>
                        <p className="font-semibold">{liturgy.title}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(`${liturgy.liturgy_date}T00:00:00`), "PPP", { locale: ptBR })}</p>
                    </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToLiturgyDialog;