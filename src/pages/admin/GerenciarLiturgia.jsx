import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Book, PlusCircle, Loader2, Calendar, Trash2, Edit, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { createNotificationForAllUsers } from '@/lib/notificationUtils';
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

const GerenciarLiturgia = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [liturgies, setLiturgies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingLiturgy, setEditingLiturgy] = useState(null);

  const fetchLiturgies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('liturgies')
      .select('*, liturgy_steps(count)')
      .order('liturgy_date', { ascending: false });

    if (error) {
      toast({ title: 'Erro ao buscar liturgias', description: error.message, variant: 'destructive' });
    } else {
      setLiturgies(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchLiturgies();
  }, [fetchLiturgies]);

  const handleOpenForm = (liturgy = null) => {
    setEditingLiturgy(liturgy);
    setFormOpen(true);
  };

  const handleDeleteLiturgy = async (liturgyId) => {
    const { error: stepsError } = await supabase.from('liturgy_steps').delete().eq('liturgy_id', liturgyId);
    if (stepsError) {
      toast({ title: 'Erro ao remover passos da liturgia', description: stepsError.message, variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('liturgies').delete().eq('id', liturgyId);
    if (error) {
      toast({ title: 'Erro ao excluir liturgia', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Liturgia excluída com sucesso!' });
      fetchLiturgies();
    }
  };

  const LiturgyForm = ({ liturgy, onFinished }) => {
    const [title, setTitle] = useState(liturgy?.title || '');
    const [date, setDate] = useState(liturgy?.liturgy_date || '');
    const [isSubmitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      const isEditing = !!liturgy;
      const upsertData = { title, liturgy_date: date };
      if (isEditing) {
        upsertData.id = liturgy.id;
      }

      const { data: savedData, error } = await supabase.from('liturgies').upsert(upsertData).select().single();

      if (error) {
        toast({ title: 'Erro ao salvar liturgia', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: `Liturgia ${isEditing ? 'atualizada' : 'criada'} com sucesso!` });
        if (!isEditing) {
          await createNotificationForAllUsers({
            title: 'Nova Liturgia Publicada!',
            message: `Confira a nova liturgia: "${savedData.title}"`,
            link: '/liturgia'
          });
        }
        onFinished();
      }
      setSubmitting(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Salvar'}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <>
      <Helmet><title>Gerenciar Liturgia - Eclésia App</title></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold gradient-text">Gerenciar Liturgia</h1>
                <p className="text-muted-foreground">Crie e controle as liturgias semanais.</p>
              </div>
            </div>
            <Button onClick={() => handleOpenForm()}><PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Liturgia</Button>
          </div>
        </motion.div>

        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLiturgy ? 'Editar Liturgia' : 'Criar Nova Liturgia'}</DialogTitle>
            </DialogHeader>
            <LiturgyForm liturgy={editingLiturgy} onFinished={() => { setFormOpen(false); fetchLiturgies(); }} />
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {liturgies.map(liturgy => (
              <Card key={liturgy.id}>
                <CardHeader>
                  <CardTitle>{liturgy.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(parseISO(liturgy.liturgy_date + 'T00:00:00'), "PPP", { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{liturgy.liturgy_steps[0].count || 0} passo(s) na programação.</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="default" size="sm" onClick={() => navigate(`/admin/gerenciar-liturgia/${liturgy.id}`)}><Eye className="h-4 w-4 mr-2" /> Detalhes</Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenForm(liturgy)}><Edit className="h-4 w-4 mr-2" /> Editar</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-2" /> Excluir</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir a liturgia "{liturgy.title}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteLiturgy(liturgy.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default GerenciarLiturgia;