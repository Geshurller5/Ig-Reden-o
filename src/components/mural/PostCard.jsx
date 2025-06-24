import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, User, Calendar, Pin } from 'lucide-react';
import { getTypeIcon, getTypeColor, getPriorityBorder, formatDate } from '@/lib/muralUtils';
import CommentSection from './CommentSection';

const PostCard = ({ post, onLikeToggle, onCommentAdded, onCommentDeleted, isPinned = false }) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      layout
    >
      <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${getPriorityBorder(post.priority)} ${isPinned ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10' : ''}`}>
        {post.image_url && (
          <div className="relative h-48 overflow-hidden">
            <img  
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              alt={`Imagem do post: ${post.title}`}
             src="https://images.unsplash.com/photo-1603123543824-49b386aac1e4" />
            <div className="absolute top-4 left-4 flex space-x-2">
              <Badge className={getTypeColor(post.type)}>
                <div className="flex items-center space-x-1">
                  {getTypeIcon(post.type)}
                  <span className="capitalize">{post.type}</span>
                </div>
              </Badge>
              {isPinned && (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <Pin className="h-3 w-3 mr-1" />
                  Fixado
                </Badge>
              )}
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                {post.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1"><User className="h-4 w-4" /><span>{post.profiles?.name || 'Sistema'}</span></div>
                <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>{formatDate(post.created_at)}</span></div>
              </div>
            </div>
            {!post.image_url && (
              <div className="flex-shrink-0 flex items-center space-x-2">
                 <Badge className={getTypeColor(post.type)}>
                    <div className="flex items-center space-x-1">{getTypeIcon(post.type)}<span className="capitalize">{post.type}</span></div>
                  </Badge>
                {isPinned && <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><Pin className="h-3 w-3 mr-1" />Fixado</Badge>}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">{post.content}</p>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => onLikeToggle(post.id, post.is_liked)} className={`${post.is_liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'} transition-colors`}>
                <Heart className={`h-4 w-4 mr-2 ${post.is_liked ? 'fill-current' : ''}`} />
                {post.like_count}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="text-muted-foreground hover:text-blue-500 transition-colors">
                <MessageSquare className="h-4 w-4 mr-2" />
                {post.comment_count}
              </Button>
            </div>
          </div>
          <AnimatePresence>
            {showComments && <CommentSection postId={post.id} comments={post.post_comments} onCommentAdded={onCommentAdded} onCommentDeleted={(commentId) => onCommentDeleted(post.id, commentId)} />}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PostCard;