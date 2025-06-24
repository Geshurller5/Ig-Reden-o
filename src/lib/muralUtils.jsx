import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Music, GraduationCap, Calendar, Users, FolderHeart as HandHeart } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const getTypeIcon = (type) => {
  const icons = {
    aviso: <Megaphone className="h-3 w-3 mr-1" />,
    evento: <Calendar className="h-3 w-3 mr-1" />,
    escala: <Users className="h-3 w-3 mr-1" />,
    louvor: <Music className="h-3 w-3 mr-1" />,
    ebd: <GraduationCap className="h-3 w-3 mr-1" />,
    oferta: <HandHeart className="h-3 w-3 mr-1" />,
  };
  return icons[type] || <Megaphone className="h-3 w-3 mr-1" />;
};

export const getTypeColor = (type) => {
  const colors = {
    aviso: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    evento: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    escala: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    louvor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ebd: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    oferta: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export const getPriorityBorder = (priority) => {
  switch (priority) {
    case 'high':
      return 'border-l-4 border-red-500';
    case 'medium':
      return 'border-l-4 border-yellow-500';
    default:
      return 'border-l-4 border-transparent';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Data desconhecida';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "agora mesmo";
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)}h`;
  
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const createMuralPost = async ({ title, content, type, priority = 'normal', user_id, image_url = null }) => {
  const { data, error } = await supabase
    .from('posts')
    .insert([{
      title,
      content,
      type,
      priority,
      user_id,
      image_url,
      is_pinned: false
    }]);

  if (error) {
    console.error('Error creating mural post:', error);
    return { error };
  }

  return { data };
};