import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LyricsModal = ({ isOpen, onClose, song, defaultTab = 'letra' }) => {
  if (!song) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{song.title}</DialogTitle>
          <DialogDescription>{song.artist}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="letra" disabled={!song.lyrics}>Letra</TabsTrigger>
            <TabsTrigger value="cifra" disabled={!song.cifra_url}>Cifra</TabsTrigger>
          </TabsList>
          <TabsContent value="letra" className="flex-grow mt-4 overflow-y-auto pr-4 -mr-4">
            <pre className="whitespace-pre-wrap text-sm font-sans">{song.lyrics || 'Letra não disponível.'}</pre>
          </TabsContent>
          <TabsContent value="cifra" className="flex-grow mt-4 overflow-y-auto pr-4 -mr-4">
            <pre className="whitespace-pre-wrap text-sm font-mono">{song.cifra_url || 'Cifra não disponível.'}</pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LyricsModal;