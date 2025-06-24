import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, PlusCircle, Trash2, GripVertical, Music, BookOpen, User, Search, Save, ClipboardPaste, HeartHandshake as Handshake, Hand as HeartHand, Coins as HandCoins, Users, Home, Annoyed } from 'lucide-react';
import { createNotificationForAllUsers } from '@/lib/notificationUtils';

const stepTypes = [
  { value: 'louvor', label: 'Louvor', icon: Music },
  { value: 'leitura', label: 'Leitura Bíblica', icon: BookOpen },
  { value: 'oracao', label: 'Oração', icon: Handshake },
  { value: 'ofertório', label: 'Momento Ofertório', icon: HandCoins },
  { value: 'intercessao', label: 'Intercessão', icon: Users },
  { value: 'comunhao', label: 'Comunhão', icon: HeartHand },
  { value: 'familia', label: 'Momento da Família', icon: Home },
  { value: 'avisos', label: 'Avisos', icon: Annoyed },
  { value: 'outro', label: 'Outro', icon: User },
];

const DetalhesLiturgia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [liturgy, setLiturgy] = useState(null);
  const [steps, setSteps] = useState([]);
  const [initialSteps, setInitialSteps] = useState([]);
  const [stepsToDelete, setStepsToDelete] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [isSongDialogOpen, setSongDialogOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [songSearchTerm, setSongSearchTerm] = useState('');

  const isDirty = JSON.stringify(steps) !== JSON.stringify(initialSteps) || stepsToDelete.length > 0;

  const fetchLiturgyData = useCallback(async () => {
    setLoading(true);
    const { data: liturgyData, error: liturgyError } = await supabase.from('liturgies').select('*').eq('id', id).single();
    if (liturgyError) {
      toast({ title: 'Erro ao buscar liturgia', description: liturgyError.message, variant: 'destructive' });
      navigate('/admin/gerenciar-liturgia');
      return;
    }
    setLiturgy(liturgyData);

    const { data: stepsData, error: stepsError } = await supabase.from('liturgy_steps').select('*, profiles(*)').eq('liturgy_id', id).order('step_order', { ascending: true });
    if (stepsError) {
      toast({ title: 'Erro ao buscar etapas', description: stepsError.message, variant: 'destructive' });
    } else {
      const formattedSteps = stepsData.map(s => ({...s, content: s.content || {}}));
      setSteps(formattedSteps);
      setInitialSteps(JSON.parse(JSON.stringify(formattedSteps)));
    }

    const { data: usersData, error: usersError } = await supabase.from('profiles').select('id, name, surname');
    if (usersError) toast({ title: 'Erro ao buscar usuários', description: usersError.message, variant: 'destructive' });
    else setUsers(usersData);

    const { data: songsData, error: songsError } = await supabase.from('songs').select('*');
    if (songsError) toast({ title: 'Erro ao buscar músicas', description: songsError.message, variant: 'destructive' });
    else setSongs(songsData);

    setLoading(false);
  }, [id, toast, navigate]);

  useEffect(() => {
    fetchLiturgyData();
  }, [fetchLiturgyData]);

  const handleAddStep = () => {
    const newStep = {
      id: `new-${Date.now()}`,
      liturgy_id: id,
      title: 'Nova Etapa',
      description: '',
      type: 'outro',
      step_order: steps.length,
      content: {},
      assigned_user_id: null,
      profiles: null
    };
    setSteps([...steps, newStep]);
  };

  const handleUpdateStep = (stepId, field, value) => {
    setSteps(currentSteps => currentSteps.map(step => step.id === stepId ? { ...step, [field]: value } : step));
  };
  
  const handleUpdateStepContent = (stepId, content) => {
    setSteps(currentSteps => currentSteps.map(step => step.id === stepId ? { ...step, content: content } : step));
  };

  const handleDeleteStep = (stepId) => {
    if (!String(stepId).startsWith('new-')) {
      setStepsToDelete([...stepsToDelete, stepId]);
    }
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSteps(items.map((item, index) => ({ ...item, step_order: index })));
  };

  const handleAddSongToStep = (songToAdd) => {
    const step = steps.find(s => s.id === selectedStepId);
    if (!step) return;
    
    const currentSongs = step.content?.songs || [];
    if (currentSongs.some(s => s.id === songToAdd.id)) {
      toast({ title: 'Música já adicionada', variant: 'default' });
      return;
    }
    
    const newSongs = [...currentSongs, songToAdd];
    handleUpdateStepContent(selectedStepId, { ...step.content, songs: newSongs });
    toast({ title: 'Música adicionada à etapa!' });
  };

  const handleRemoveSongFromStep = (stepId, songId) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    const newSongs = (step.content?.songs || []).filter(s => s.id !== songId);
    handleUpdateStepContent(stepId, { ...step.content, songs: newSongs });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    if (stepsToDelete.length > 0) {
      const { error: deleteError } = await supabase.from('liturgy_steps').delete().in('id', stepsToDelete);
      if (deleteError) {
        toast({ title: 'Erro ao excluir etapas', description: deleteError.message, variant: 'destructive' });
        setIsSaving(false);
        return;
      }
    }

    const stepsToUpsert = steps.map((step, index) => {
      const { profiles, ...rest } = step; 
      const cleanStep = {
        ...rest,
        step_order: index,
        liturgy_id: id,
      };
      if (String(cleanStep.id).startsWith('new-')) {
        delete cleanStep.id;
      }
      return cleanStep;
    });

    if (stepsToUpsert.length > 0) {
      const { error: upsertError } = await supabase.from('liturgy_steps').upsert(stepsToUpsert);
      if (upsertError) {
        toast({ title: 'Erro ao salvar alterações', description: upsertError.message, variant: 'destructive' });
        setIsSaving(false);
        return;
      }
    }
    
    toast({ title: 'Liturgia salva com sucesso!' });
    await createNotificationForAllUsers({
        title: 'Liturgia Atualizada!',
        message: `A programação de "${liturgy.title}" foi atualizada.`,
        link: '/liturgia'
    });
    setIsSaving(false);
    setStepsToDelete([]);
    fetchLiturgyData();
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(songSearchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(songSearchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <>
      <Helmet><title>Detalhes da Liturgia: {liturgy?.title}</title></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold gradient-text">{liturgy.title}</h1>
          <p className="text-muted-foreground">Gerencie as etapas desta liturgia. Arraste para reordenar.</p>
        </motion.div>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="steps">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {steps.map((step, index) => (
                  <Draggable key={step.id} draggableId={String(step.id)} index={index}>
                    {(provided) => (
                      <motion.div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} layout>
                        <Card className="bg-card/80 backdrop-blur-sm">
                          <CardContent className="p-4 flex items-start gap-4">
                            <div className="flex-grow space-y-4">
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <Input value={step.title} onChange={(e) => handleUpdateStep(step.id, 'title', e.target.value)} className="text-lg font-semibold border-none focus-visible:ring-1" />
                              </div>
                              <div className="relative">
                                <Textarea value={step.description || ''} onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)} placeholder="Descrição da etapa (Ex: Gênesis 1:1-5)" />
                                {step.type === 'leitura' && (
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        title="Colar referência da Bíblia"
                                        className="absolute bottom-2 right-2 h-7 w-7"
                                        onClick={async () => {
                                            try {
                                                const text = await navigator.clipboard.readText();
                                                handleUpdateStep(step.id, 'description', text);
                                                toast({ title: 'Referência colada!' });
                                            } catch (err) {
                                                toast({ title: 'Falha ao colar', description: 'Não foi possível ler da área de transferência.', variant: 'destructive' });
                                            }
                                        }}
                                    >
                                        <ClipboardPaste className="h-4 w-4" />
                                    </Button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select value={step.type} onValueChange={(value) => handleUpdateStep(step.id, 'type', value)}>
                                  <SelectTrigger><SelectValue placeholder="Tipo de etapa" /></SelectTrigger>
                                  <SelectContent>
                                    {stepTypes.map(({ value, label, icon: Icon }) => (
                                      <SelectItem key={value} value={value}><Icon className="h-4 w-4 mr-2 inline-block" />{label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select value={step.assigned_user_id || ''} onValueChange={(value) => handleUpdateStep(step.id, 'assigned_user_id', value)}>
                                  <SelectTrigger><SelectValue placeholder="Responsável" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={null}>Ninguém</SelectItem>
                                    {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name} {u.surname}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              {step.type === 'louvor' && (
                                <div className="pt-4 border-t">
                                  <h4 className="font-semibold mb-2">Músicas</h4>
                                  <div className="space-y-2">
                                    {(step.content?.songs || []).map(song => (
                                      <div key={song.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                                        <div>
                                          <p className="font-medium">{song.title}</p>
                                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveSongFromStep(step.id, song.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                      </div>
                                    ))}
                                  </div>
                                  <Button variant="outline" size="sm" className="mt-2" onClick={() => { setSelectedStepId(step.id); setSongDialogOpen(true); }} disabled={!['admin', 'Lider de Ministerio'].includes(user.role)}>
                                    <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Música
                                  </Button>
                                </div>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteStep(step.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex justify-center mt-6">
          <Button onClick={handleAddStep}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Etapa</Button>
        </div>
      </div>
      
      <AnimatePresence>
        {isDirty && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t z-10">
            <div className="container mx-auto flex justify-end">
              <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                Salvar Alterações
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isSongDialogOpen} onOpenChange={setSongDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Música ao Louvor</DialogTitle>
          </DialogHeader>
          <div className="relative my-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por título ou artista..." value={songSearchTerm} onChange={(e) => setSongSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
            {filteredSongs.map(song => (
              <div key={song.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                <div>
                  <p className="font-semibold">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>
                <Button size="sm" onClick={() => handleAddSongToStep(song)}>Adicionar</Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DetalhesLiturgia;