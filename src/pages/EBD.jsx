import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Heart, MessageCircle, Calendar, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import EbdStudyModal from '@/components/modals/EbdStudyModal';

const EBD = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [initialShowComments, setInitialShowComments] = useState(false);

  const fetchStudies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ebd_studies')
      .select(`
        *,
        author:profiles!ebd_studies_author_id_fkey(name, surname),
        likes:ebd_study_likes(user_id),
        comments:ebd_study_comments(id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Erro ao buscar estudos", description: error.message, variant: "destructive" });
    } else {
      const processedData = data.map(study => ({
        ...study,
        like_count: study.likes.length,
        comment_count: study.comments.length,
        is_liked: user ? study.likes.some(like => like.user_id === user.id) : false,
      }));
      setStudies(processedData);
    }
    setLoading(false);
  }, [toast, user]);

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  const handleLike = async (studyId, isLiked) => {
    if (!user) {
        toast({ title: "Ação requer login", description: "Você precisa estar logado para curtir.", variant: "destructive" });
        return;
    }

    if (isLiked) {
      await supabase.from('ebd_study_likes').delete().match({ study_id: studyId, user_id: user.id });
    } else {
      await supabase.from('ebd_study_likes').insert({ study_id: studyId, user_id: user.id });
    }
    fetchStudies();
  };

  const handleReadMore = (study, showComments = false) => {
    setSelectedStudy(study);
    setInitialShowComments(showComments);
  };

  const handleCommentAdded = () => {
    fetchStudies();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getThemeColor = (theme) => {
    const themes = {
      'Vida Cristã': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Oração': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Teologia': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'História': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return themes[theme] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <>
      <Helmet>
        <title>EBD - Eclésia App</title>
        <meta name="description" content="Estudos bíblicos da Escola Bíblica Dominical com conteúdo interativo." />
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold gradient-text">Escola Bíblica Dominical</h1>
          </div>
          <p className="text-muted-foreground">Estudos bíblicos para crescimento espiritual</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : studies.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground py-16">
            <p>Nenhum estudo publicado no momento.</p>
            <p className="text-sm">O administrador pode adicionar novos estudos no painel de gerenciamento.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map((study, index) => (
              <motion.div key={study.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  {study.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" alt={`Imagem do estudo: ${study.title}`} src={study.image_url} />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <Badge className={`${getThemeColor(study.theme)} mb-2 self-start`}>{study.theme}</Badge>
                    <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer line-clamp-2" onClick={() => handleReadMore(study)}>{study.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground pt-1">
                      <div className="flex items-center space-x-1"><BookOpen className="h-4 w-4" /><span>{study.bible_ref}</span></div>
                      <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>{formatDate(study.created_at)}</span></div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-grow">
                    <p className="text-muted-foreground leading-relaxed line-clamp-4">{study.content}</p>
                  </CardContent>
                  <div className="p-6 pt-0 flex items-center justify-between border-t mt-4">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" onClick={() => handleLike(study.id, study.is_liked)} className={`${study.is_liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'} transition-colors`}>
                        <Heart className={`h-4 w-4 mr-2 ${study.is_liked ? 'fill-current' : ''}`} />{study.like_count}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleReadMore(study, true)} className="text-muted-foreground hover:text-blue-500 transition-colors">
                        <MessageCircle className="h-4 w-4 mr-2" />{study.comment_count}
                      </Button>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleReadMore(study, false)}>Ler Mais</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <EbdStudyModal 
        study={selectedStudy} 
        isOpen={!!selectedStudy} 
        onClose={() => setSelectedStudy(null)}
        onCommentAdded={handleCommentAdded}
        initialShowComments={initialShowComments}
      />
    </>
  );
};

export default EBD;