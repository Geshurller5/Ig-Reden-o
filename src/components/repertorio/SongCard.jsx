import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, FileText, Youtube, MicOff as MicVocal, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SongCard = ({ song, index, onAddToPlaylist, onSendToLiturgy }) => {
  const { user } = useAuth();

  const openLink = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: index * 0.05 }} 
      whileHover={{ scale: 1.02 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 group flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">{song.title}</CardTitle>
          <CardDescription className="mt-1">{song.artist}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => openLink(song.youtube_url)} disabled={!song.youtube_url}><Youtube className="h-4 w-4 mr-2" />YouTube</Button>
            <Button size="sm" variant="outline" onClick={() => openLink(song.cifra_url)} disabled={!song.cifra_url}><FileText className="h-4 w-4 mr-2" />Cifra</Button>
            <Button size="sm" variant="outline" onClick={() => openLink(song.lyrics)} disabled={!song.lyrics}><MicVocal className="h-4 w-4 mr-2" />Letra</Button>
          </div>
          {user && (
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="w-full" onClick={() => onAddToPlaylist(song)}><Plus className="h-4 w-4 mr-2" />Playlist</Button>
              <Button size="sm" variant="secondary" className="w-full" onClick={() => onSendToLiturgy(song)}><Send className="h-4 w-4 mr-2" />Liturgia</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SongCard;