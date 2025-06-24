import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PREDEFINED_AVATARS } from '@/data/avatars';

const AvatarSelectionModal = ({ isOpen, onClose, onAvatarSelect }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escolha seu novo avatar</DialogTitle>
          <DialogDescription>
            Clique em uma imagem para definir como seu novo avatar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 py-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
          {PREDEFINED_AVATARS.map((avatarUrl, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1, rotate: 3 }}
              whileTap={{ scale: 0.9 }}
              className="cursor-pointer"
              onClick={() => {
                onAvatarSelect(avatarUrl);
                onClose();
              }}
            >
              <Avatar className="h-24 w-24 border-2 border-transparent hover:border-primary transition-all">
                <AvatarImage src={avatarUrl} alt={`Avatar ${index + 1}`} />
                <AvatarFallback>A{index + 1}</AvatarFallback>
              </Avatar>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarSelectionModal;