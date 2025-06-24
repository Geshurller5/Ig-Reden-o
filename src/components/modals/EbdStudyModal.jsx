import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, Loader2, MessageCircle } from 'lucide-react';

const EbdStudyModal = ({ study, isOpen, onClose, onCommentAdded, initialShowComments = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!study) return;
    setLoadingComments(true);
    const { data, error } = await supabase
      .from('ebd_study_comments')
      .select('*, profile:profiles(name, surname, avatar)')
      .eq('study_id', study.id)
      .order('created_at', { ascending: true });
    
    if (error) {
      toast({ title: 'Erro ao buscar comentários', variant: 'destructive', description: error.message });
    } else {
      setComments(data);
    }
    setLoadingComments(false);
  }, [study, toast]);

  useEffect(() => {
    if (isOpen) {
      setShowComments(initialShowComments);
      fetchComments();
    }
  }, [isOpen, initialShowComments, fetchComments]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) {
        if(!user) toast({ title: 'Faça login para comentar', variant: 'destructive' });
        return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from('ebd_study_comments')
      .insert({
        study_id: study.id,
        user_id: user.id,
        text: newComment.trim(),
      })
      .select('*, profile:profiles(name, surname, avatar)')
      .single();

    if (error) {
      toast({ title: 'Erro ao enviar comentário', variant: 'destructive', description: error.message });
    } else {
      setComments(prev => [...prev, data]);
      setNewComment('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    }
    setSubmitting(false);
  };

  if (!study) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{study.title}</DialogTitle>
          <DialogDescription>{study.theme} - {study.bible_ref}</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6 scrollbar-hide">
          {study.image_url && <img src={study.image_url} alt={study.title} className="rounded-lg w-full h-64 object-cover" />}
          <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">{study.content}</p>
          
          <div className="border-t pt-4 mt-6">
            {showComments ? (
              <>
                <h3 className="font-semibold mb-4">Comentários ({comments.length})</h3>
                {loadingComments ? <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div> : (
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarImage src={comment.profile?.avatar} />
                          <AvatarFallback>{comment.profile?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{comment.profile?.name} {comment.profile?.surname}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { locale: ptBR, addSuffix: true })}</p>
                          </div>
                          <p className="text-sm mt-1">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Seja o primeiro a comentar!</p>}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center">
                <Button variant="outline" onClick={() => setShowComments(true)}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Mostrar Comentários ({loadingComments ? '...' : comments.length})
                </Button>
              </div>
            )}
          </div>
        </div>
        {user && showComments && (
          <form onSubmit={handleCommentSubmit} className="flex-shrink-0 flex items-start space-x-3 pt-4 border-t">
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name?.[0]}</AvatarFallback>
            </Avatar>
            <Textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              rows={1}
              className="flex-1"
            />
            <Button type="submit" disabled={submitting || !newComment.trim()}>
              {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EbdStudyModal;