import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Trash2, AtSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CommentSection = ({ postId, comments, onCommentAdded, onCommentDeleted }) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, surname, avatar')
      .order('name', { ascending: true });
    
    if (!error) {
      setUsers(data);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    setNewComment(value);
    setCursorPosition(position);

    const textBeforeCursor = value.substring(0, position);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setMentionQuery('');
    }
  };

  const insertMention = (selectedUser) => {
    const textBeforeCursor = newComment.substring(0, cursorPosition);
    const textAfterCursor = newComment.substring(cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.substring(0, mentionMatch.index);
      const mention = `@${selectedUser.name} ${selectedUser.surname}`;
      const newText = beforeMention + mention + ' ' + textAfterCursor;
      
      setNewComment(newText);
      setShowSuggestions(false);
      setMentionQuery('');
    }
  };

  const extractMentions = (text) => {
    const mentionRegex = /@([^@\s]+(?:\s+[^@\s]+)*)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1].trim();
      const mentionedUser = users.find(u => 
        `${u.name} ${u.surname}`.toLowerCase() === mentionedName.toLowerCase()
      );
      
      if (mentionedUser) {
        mentions.push(mentionedUser);
      }
    }
    
    return mentions;
  };

  const createMentionNotifications = async (mentionedUsers, postId) => {
    if (mentionedUsers.length === 0) return;
    
    const notifications = mentionedUsers.map(mentionedUser => ({
      user_id: mentionedUser.id,
      title: 'Você foi mencionado!',
      message: `${user.name} ${user.surname} mencionou você em um comentário.`,
      link: `/mural`,
      is_read: false
    }));

    await supabase.from('notifications').insert(notifications);
  };

  const filteredUsers = users.filter(u => 
    mentionQuery === '' || 
    `${u.name} ${u.surname}`.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setLoading(true);

    const mentionedUsers = extractMentions(newComment);

    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, text: newComment })
      .select('*, profile:profiles(name, surname, avatar)')
      .single();

    if (error) {
      toast({ title: "Erro ao comentar", description: error.message, variant: "destructive" });
    } else {
      onCommentAdded(data);
      await createMentionNotifications(mentionedUsers, postId);
      setNewComment('');
    }
    setLoading(false);
  };

  const handleDeleteClick = (commentId) => {
    setCommentToDeleteId(commentId);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDeleteId) return;

    const { error } = await supabase
      .from('post_comments')
      .delete()
      .match({ id: commentToDeleteId });

    if (error) {
      toast({ title: "Erro ao excluir comentário", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Comentário excluído!" });
      onCommentDeleted(commentToDeleteId);
    }
    setIsAlertOpen(false);
    setCommentToDeleteId(null);
  };

  const renderCommentText = (text) => {
    const mentionRegex = /@([^@\s]+(?:\s+[^@\s]+)*)/g;
    const parts = text.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const mentionedUser = users.find(u => 
          `${u.name} ${u.surname}`.toLowerCase() === part.toLowerCase()
        );
        
        if (mentionedUser) {
          return (
            <span key={index} className="text-primary font-semibold bg-primary/10 px-1 rounded">
              @{part}
            </span>
          );
        }
      }
      return part;
    });
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="pt-4 mt-4 border-t"
      >
        <div className="space-y-4 max-h-48 overflow-y-auto scrollbar-hide pr-2">
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start space-x-3 group"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar} alt={comment.profiles?.name} />
                  <AvatarFallback>{comment.profiles?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm bg-muted p-2 rounded-lg flex-1">
                  <span className="font-semibold">{comment.profiles?.name} {comment.profiles?.surname}</span>
                  <p className="text-muted-foreground">{renderCommentText(comment.text)}</p>
                </div>
                {user && user.id === comment.user_id && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteClick(comment.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="relative">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Input
                placeholder="Adicione um comentário... (use @ para mencionar)"
                value={newComment}
                onChange={handleInputChange}
                disabled={!user || loading}
              />
              <AtSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button type="submit" size="icon" disabled={!newComment.trim() || !user || loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {showSuggestions && filteredUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto"
            >
              {filteredUsers.map(suggestedUser => (
                <div
                  key={suggestedUser.id}
                  onClick={() => insertMention(suggestedUser)}
                  className="flex items-center space-x-2 p-2 hover:bg-muted cursor-pointer"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={suggestedUser.avatar} alt={suggestedUser.name} />
                    <AvatarFallback className="text-xs">{suggestedUser.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{suggestedUser.name} {suggestedUser.surname}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente seu comentário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCommentToDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CommentSection;