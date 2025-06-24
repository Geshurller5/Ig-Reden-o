import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const ProfileModal = ({ member, onClose }) => {
  const open = !!member;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AnimatePresence>
        {open && member && (
          <DialogContent 
            className="p-0 border-0 max-w-md"
            onInteractOutside={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="relative">
                <div className="h-24 bg-gradient-to-r from-primary to-purple-600 rounded-t-lg" />
                <button 
                  onClick={onClose} 
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Fechar</span>
                </button>
                <div className="absolute top-12 left-1/2 -translate-x-1/2">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                    <AvatarImage src={member.avatar} alt={`${member.name} ${member.surname}`} />
                    <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                      {(member.name || ' ').charAt(0)}{(member.surname || ' ').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="pt-16 p-6 text-center">
                <h2 className="text-2xl font-bold">{member.name} {member.surname}</h2>
                <Badge variant="secondary" className="mt-2">{member.role_display || member.role}</Badge>
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                  {member.bio || "Este membro ainda não adicionou uma biografia."}
                </p>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default ProfileModal;