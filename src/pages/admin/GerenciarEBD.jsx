import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, PlusCircle, Edit, Trash2, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { createMuralPost } from '@/lib/muralUtils';
import { createNotificationForAllUsers } from '@/lib/notificationUtils';

const GerenciarEBD = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ebd_studies')
      .select('*, likes:ebd_study_likes(count), comments:ebd_study_comments(count)')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erro ao buscar estudos.', description: error.message, variant: 'destructive' });
    } else {
      setStudies(data.map(s => ({
        ...s,
        like_count: s.likes[0]?.count || 0,
        comment_count: s.comments[0]?.count || 0
      })));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  const handleSaveStudy = async (studyData) => {
    const studyPayload = {
        title: studyData.title,
        theme: studyData.theme,
        bible_ref: studyData.bible_ref,
        image_url: studyData.image_url,
        content: studyData.content,
        author_id: user.id
    };

    if (studyData.id) {
      const { error } = await supabase.from('ebd_studies').update(studyPayload).eq('id', studyData.id);
      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Estudo atualizado!", description: `"${studyData.title}" foi salvo com sucesso.` });
        await createNotificationForAllUsers({
          title: 'Estudo da EBD Atualizado!',
          message: `O estudo "${studyData.title}" foi atualizado. Confira!`,
          link: `/ebd`
        });
      }
    } else {
      const { data, error } = await supabase.from('ebd_studies').insert(studyPayload).select().single();
      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Estudo criado!", description: `"${studyData.title}" foi adicionado.` });
        await createMuralPost({
            title: `Novo Estudo da EBD: ${data.title}`,
            content: `Um novo material de estudo foi adicionado à Escola Bíblica Dominical. Acesse a seção da EBD para conferir!`,
            type: 'ebd',
            user_id: user.id
        });
        await createNotificationForAllUsers({
          title: 'Novo Estudo da EBD!',
          message: `Confira o novo estudo: "${data.title}"`,
          link: `/ebd`
        });
      }
    }
    fetchStudies();
  };

  const handleDeleteStudy = async (studyId, studyTitle) => {
    const { error } = await supabase.from('ebd_studies').delete().eq('id', studyId);
    if(error){
        toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "Estudo excluído!", description: `"${studyTitle}" foi removido.`, variant: "destructive" });
        fetchStudies();
    }
  };

  const StudyForm = ({ study, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(study || { title: '', theme: '', bible_ref: '', image_url: '', content: '' });
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Título do estudo" required />
        <div className="grid grid-cols-2 gap-4">
          <Input name="theme" value={formData.theme} onChange={handleChange} placeholder="Tema" />
          <Input name="bible_ref" value={formData.bible_ref} onChange={handleChange} placeholder="Texto bíblico base" />
        </div>
        <Input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="URL da imagem de capa" />
        <Textarea name="content" value={formData.content} onChange={handleChange} placeholder="Conteúdo do estudo" rows={5} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit">Salvar Estudo</Button>
        </DialogFooter>
      </form>
    );
  };
  
  const AddEditStudyDialog = ({ study, children, onSave }) => {
    const [open, setOpen] = useState(false);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader><DialogTitle>{study ? 'Editar Estudo' : 'Adicionar Estudo'}</DialogTitle></DialogHeader>
          <StudyForm study={study} onSubmit={(data) => { onSave(data); setOpen(false); }} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Helmet><title>Gerenciar EBD - Eclésia App</title></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Gerenciar EBD</h1>
              <p className="text-muted-foreground">Crie e edite os estudos da Escola Bíblica.</p>
            </div>
          </div>
          <AddEditStudyDialog onSave={handleSaveStudy}>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Estudo</Button>
          </AddEditStudyDialog>
        </motion.div>

        {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map((study, index) => (
                <motion.div key={study.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
                <Card className="h-full flex flex-col">
                    <CardHeader>
                    <CardTitle className="line-clamp-1">{study.title}</CardTitle>
                    <CardDescription>{study.theme} - {study.bible_ref}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">{study.content}</p>
                    </CardContent>
                    <div className="p-6 pt-0 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center"><Heart className="h-4 w-4 mr-1 text-red-500" /> {study.like_count}</span>
                        <span className="flex items-center"><MessageCircle className="h-4 w-4 mr-1 text-blue-500" /> {study.comment_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <AddEditStudyDialog study={study} onSave={handleSaveStudy}><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></AddEditStudyDialog>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteStudy(study.id, study.title)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
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

export default GerenciarEBD;