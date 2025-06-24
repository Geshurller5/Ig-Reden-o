import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Megaphone, Pin } from 'lucide-react';
import PostCard from '@/components/mural/PostCard';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const Mural = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles ( name, surname, avatar ),
        post_comments ( id, text, created_at, user_id, profiles ( name, surname, avatar )),
        post_likes ( user_id )
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    
    if (error) {
      toast({ title: "Erro ao buscar posts", description: error.message, variant: "destructive" });
      setPosts([]);
    } else {
      const processedPosts = data.map(post => ({
        ...post,
        like_count: post.post_likes.length,
        is_liked: user ? post.post_likes.some(like => like.user_id === user.id) : false,
        comment_count: post.post_comments.length
      }));
      setPosts(processedPosts);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLikeToggle = async (postId, isLiked) => {
    if (!user) {
      toast({ title: "Ação requer login", description: "Você precisa estar logado para curtir.", variant: "destructive" });
      return;
    }
    
    if (isLiked) {
      await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    }
    fetchPosts();
  };
  
  const handleCommentAdded = (newComment) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === newComment.post_id
          ? {
              ...post,
              post_comments: [...post.post_comments, newComment],
              comment_count: post.comment_count + 1
            }
          : post
      )
    );
  };

  const handleCommentDeleted = (postId, commentId) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            post_comments: post.post_comments.filter(c => c.id !== commentId),
            comment_count: post.comment_count - 1,
          };
        }
        return post;
      })
    );
  };

  const pinnedPosts = posts.filter(post => post.is_pinned);
  const regularPosts = posts.filter(post => !post.is_pinned);

  return (
    <>
      <Helmet><title>Mural - Eclésia App</title><meta name="description" content="Acompanhe os avisos, comunicados e eventos da igreja no mural interativo." /></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2"><Megaphone className="h-8 w-8 text-primary" /><h1 className="text-3xl font-bold gradient-text">Mural de Avisos</h1></div>
          <p className="text-muted-foreground">Fique por dentro de todos os comunicados e eventos</p>
        </motion.div>
        
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        ) : (
        <>
            {pinnedPosts.length > 0 && (
              <div className="space-y-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center space-x-2">
                  <Pin className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold">Posts Fixados</h2>
                </motion.div>
                <div className="space-y-6">
                  {pinnedPosts.map((post) => (
                    <PostCard key={post.id} post={post} onLikeToggle={handleLikeToggle} onCommentAdded={handleCommentAdded} onCommentDeleted={handleCommentDeleted} isPinned />
                  ))}
                </div>
              </div>
            )}
    
            <div className="space-y-6">
              {pinnedPosts.length > 0 && regularPosts.length > 0 && (
                <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-xl font-bold pt-4 border-t">Outros Avisos</motion.h2>
              )}
              {regularPosts.map((post) => (
                <PostCard key={post.id} post={post} onLikeToggle={handleLikeToggle} onCommentAdded={handleCommentAdded} onCommentDeleted={handleCommentDeleted} />
              ))}
            </div>
        </>
        )}
      </div>
    </>
  );
};

export default Mural;